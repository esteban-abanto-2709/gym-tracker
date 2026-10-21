import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { User } from '@prisma/client';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { DeleteMeDto } from './dto/delete-me.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { fromDbDate, toDbDate } from '@/common/date-only';

const DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g');

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client();

  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const slug = await this.uniqueSlug(dto.username);

    const user = await this.prisma.user.create({
      data: { email: dto.email, username: dto.username, slug, passwordHash },
    });

    return this.publicUser(user);
  }

  async validateUser(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (
      !user ||
      !user.passwordHash ||
      !(await bcrypt.compare(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.publicUser(user);
  }

  async loginWithGoogle(credential: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) {
      throw new UnauthorizedException('Cuenta de Google no verificada');
    }
    const email = payload.email.trim().toLowerCase();

    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ googleId: payload.sub }, { email }] },
    });

    if (existing) {
      if (existing.googleId) return this.publicUser(existing);
      const linked = await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          googleId: payload.sub,
          passwordHash: null,
          tokenVersion: { increment: 1 },
        },
      });
      return this.publicUser(linked);
    }

    const username = payload.name || email.split('@')[0];
    const slug = await this.uniqueSlug(username);
    const user = await this.prisma.user.create({
      data: { email, username, slug, googleId: payload.sub },
    });
    return this.publicUser(user);
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }

  async tokenVersion(id: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: { tokenVersion: true },
    });
    return user.tokenVersion;
  }

  async revokeSessions(id: string, currentVersion: number) {
    await this.prisma.user.updateMany({
      where: { id, tokenVersion: currentVersion },
      data: { tokenVersion: { increment: 1 } },
    });
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    if (!user.passwordHash) {
      throw new BadRequestException('Account has no password');
    }
    if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new ForbiddenException('Current password does not match');
    }
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        passwordHash: await bcrypt.hash(dto.newPassword, 10),
        tokenVersion: { increment: 1 },
      },
    });
    return this.publicUser(updated);
  }

  async deleteMe(id: string, dto: DeleteMeDto) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    const confirmed = user.passwordHash
      ? !!dto.password &&
        (await bcrypt.compare(dto.password, user.passwordHash))
      : dto.email === user.email;
    if (!confirmed) {
      throw new ForbiddenException('Confirmation does not match');
    }

    await this.prisma.$transaction([
      this.prisma.workout.deleteMany({ where: { userId: id } }),
      this.prisma.routine.deleteMany({ where: { userId: id } }),
      this.prisma.program.deleteMany({ where: { userId: id } }),
      this.prisma.publication.deleteMany({ where: { authorId: id } }),
      this.prisma.exercise.deleteMany({
        where: {
          createdById: id,
          workouts: { none: {} },
          routineItems: { none: {} },
          publicationItems: { none: {} },
        },
      }),
      this.prisma.exercise.updateMany({
        where: { createdById: id },
        data: { createdById: null },
      }),
      this.prisma.user.delete({ where: { id } }),
    ]);
  }

  async updateMe(id: string, dto: UpdateMeDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.birthDate !== undefined && {
          birthDate: dto.birthDate ? toDbDate(dto.birthDate) : null,
        }),
        ...(dto.exerciseLocale && { exerciseLocale: dto.exerciseLocale }),
        ...(dto.theme && { theme: dto.theme }),
        ...(dto.newsOpened && { newsOpened: [...new Set(dto.newsOpened)] }),
        ...(dto.newsSeen && { newsSeen: [...new Set(dto.newsSeen)] }),
      },
    });
    return this.publicUser(user);
  }

  private publicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      slug: user.slug,
      hasPassword: !!user.passwordHash,
      birthDate: user.birthDate ? fromDbDate(user.birthDate) : null,
      exerciseLocale: user.exerciseLocale,
      theme: user.theme,
      newsOpened: user.newsOpened,
      newsSeen: user.newsSeen,
    };
  }

  private async uniqueSlug(username: string) {
    const base =
      username
        .toLowerCase()
        .normalize('NFD')
        .replace(DIACRITICS, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'user';

    // ponytail: linear probe; the slug @unique constraint is the real backstop
    let slug = base;
    let n = 1;
    while (await this.prisma.user.findUnique({ where: { slug } })) {
      n += 1;
      slug = `${base}-${n}`;
    }
    return slug;
  }
}
