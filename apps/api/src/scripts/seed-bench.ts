import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../providers/prisma/prisma.service';

const DOMAIN = '@gym-tracker.test';
const BENCH_EMAIL = `bench${DOMAIN}`;
const BENCH_PASSWORD = 'bench-password';
const NOISE_USERS = 99;
const NOISE_SESSIONS = 50;
const BENCH_SESSIONS = 500;
const SETS_PER_SESSION = 20;
const TARGET_SETS_PER_SESSION = 4;
const SET_SPACING_MS = 4 * 60 * 1000;
const TARGET_SLUG = 'bench-press';
const TARGET_EQUIPMENT = 'barra';
const TWO_YEARS_MS = 2 * 365 * 24 * 3600 * 1000;
const CHUNK = 5000;

function assertLocalDatabase() {
  const host = new URL(process.env.DATABASE_URL ?? '').hostname;
  if (host !== 'localhost' && host !== '127.0.0.1') {
    throw new Error(`seed-bench: refusing to run against ${host}`);
  }
}

const pick = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

function randomSessions(
  userId: string,
  count: number,
  exerciseIds: string[],
  equipmentIds: string[],
  target?: { exerciseId: string; equipmentId: string },
) {
  const now = Date.now();
  const sessions = Array.from({ length: count }, () => {
    const start = now - Math.random() * TWO_YEARS_MS;
    const end = start + (SETS_PER_SESSION - 1) * SET_SPACING_MS;
    return {
      id: randomUUID(),
      userId,
      startedAt: new Date(start),
      endedAt: new Date(end),
      timeZone: 'America/Lima',
    };
  });
  const sets = sessions.flatMap((session) =>
    Array.from({ length: SETS_PER_SESSION }, (_, i) => {
      const onTarget = target && i < TARGET_SETS_PER_SESSION;
      return {
        userId,
        sessionId: session.id,
        exerciseId: onTarget ? target.exerciseId : pick(exerciseIds),
        equipmentId: onTarget ? target.equipmentId : pick(equipmentIds),
        weight: 20 + Math.round(Math.random() * 80),
        reps: 6 + Math.floor(Math.random() * 7),
        opinion: '',
        createdAt: new Date(session.startedAt.getTime() + i * SET_SPACING_MS),
      };
    }),
  );
  return { sessions, sets };
}

async function main() {
  assertLocalDatabase();
  const prisma = new PrismaService();
  try {
    const removed = await prisma.workout.deleteMany({
      where: { user: { email: { endsWith: DOMAIN } } },
    });
    await prisma.user.deleteMany({ where: { email: { endsWith: DOMAIN } } });
    console.log(`seed-bench: removed ${removed.count} previous sets`);
    if (process.argv.includes('--clean')) return;

    const exercises = await prisma.exercise.findMany({
      where: { createdById: null },
      select: { id: true, slug: true },
    });
    const equipment = await prisma.equipment.findMany({ select: { id: true } });
    const target = exercises.find((e) => e.slug === TARGET_SLUG);
    if (!target || !equipment.some((e) => e.id === TARGET_EQUIPMENT)) {
      throw new Error('seed-bench: run the official seed first');
    }
    const exerciseIds = exercises.map((e) => e.id);
    const equipmentIds = equipment.map((e) => e.id);
    const passwordHash = await bcrypt.hash(BENCH_PASSWORD, 10);

    const users = [
      { email: BENCH_EMAIL, username: 'bench', slug: 'bench' },
      ...Array.from({ length: NOISE_USERS }, (_, i) => ({
        email: `bench-noise-${i}${DOMAIN}`,
        username: `bench-noise-${i}`,
        slug: `bench-noise-${i}`,
      })),
    ];
    await prisma.user.createMany({
      data: users.map((u) => ({ ...u, passwordHash })),
    });
    const created = await prisma.user.findMany({
      where: { email: { endsWith: DOMAIN } },
      select: { id: true, email: true },
    });

    const generated = created.map((u) =>
      u.email === BENCH_EMAIL
        ? randomSessions(u.id, BENCH_SESSIONS, exerciseIds, equipmentIds, {
            exerciseId: target.id,
            equipmentId: TARGET_EQUIPMENT,
          })
        : randomSessions(u.id, NOISE_SESSIONS, exerciseIds, equipmentIds),
    );
    const sessions = generated.flatMap((g) => g.sessions);
    const sets = generated.flatMap((g) => g.sets);
    for (let i = 0; i < sessions.length; i += CHUNK) {
      await prisma.session.createMany({ data: sessions.slice(i, i + CHUNK) });
    }
    for (let i = 0; i < sets.length; i += CHUNK) {
      await prisma.workout.createMany({ data: sets.slice(i, i + CHUNK) });
    }

    const total = await prisma.workout.count();
    console.log(
      `seed-bench: ${sets.length} sets in ${sessions.length} sessions for ${created.length} users (${total} in the table)`,
    );
    console.log(
      `seed-bench: k6 env EXERCISE_ID=${target.id} EQUIPMENT_ID=${TARGET_EQUIPMENT}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
