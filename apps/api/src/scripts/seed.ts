import { PrismaService } from '../providers/prisma/prisma.service';
import { seedOfficialExercises } from '../modules/exercises/seed-official-exercises';

async function main() {
  const prisma = new PrismaService();
  try {
    const { created, updated, unchanged, skipped } =
      await seedOfficialExercises(prisma);
    console.log(
      `seed: ${created} created, ${updated} updated, ${unchanged} unchanged, ${skipped.length} skipped`,
    );
    if (skipped.length) {
      console.log(`seed: skipped user-owned slugs: ${skipped.join(', ')}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
