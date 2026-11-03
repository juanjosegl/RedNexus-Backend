import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service.js';
import { userSelect } from '../users/dto/user.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists)
      throw new ConflictException('Ya existe una cuenta con ese email');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
      },
      select: userSelect,
    });
    return { accessToken: await this.sign(user), user };
  }

  async login(dto: LoginDto) {
    const found = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    // Mismo mensaje si no existe el email o la contraseña no coincide: no revela qué cuentas hay
    if (!found || !(await bcrypt.compare(dto.password, found.passwordHash))) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }
    const user = {
      id: found.id,
      email: found.email,
      name: found.name,
      bio: found.bio,
      tags: found.tags,
    };
    return { accessToken: await this.sign(user), user };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });
    if (!user) throw new UnauthorizedException('La cuenta ya no existe');
    return user;
  }

  private sign(user: { id: string; email: string }) {
    return this.jwt.signAsync({ sub: user.id, email: user.email });
  }
}
