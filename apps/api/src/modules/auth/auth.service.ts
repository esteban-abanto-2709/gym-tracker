import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g');

@Injectable()
export class AuthService {
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

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }

  private publicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      slug: user.slug,
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
