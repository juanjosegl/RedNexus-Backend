import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

const user = {
  id: 'u1',
  email: 'ana.demo@rednexus.dev',
  name: 'Ana',
  bio: null,
  tags: [],
};

function setup(existing?: { passwordHash: string }) {
  const prisma = {
    user: {
      findUnique: vi
        .fn()
        .mockResolvedValue(existing ? { ...user, ...existing } : null),
      create: vi.fn().mockResolvedValue(user),
    },
  };
  const jwt = new JwtService({ secret: 'prueba' });
  return {
    prisma,
    jwt,
    auth: new AuthService(prisma as unknown as PrismaService, jwt),
  };
}

describe('AuthService', () => {
  it('registra con la contraseña cifrada y devuelve un token válido', async () => {
    const { prisma, jwt, auth } = setup();
    const res = await auth.register({
      email: user.email,
      password: 'demo12345',
      name: 'Ana',
    });

    const { passwordHash } = prisma.user.create.mock.calls[0][0].data;
    expect(passwordHash).not.toBe('demo12345');
    expect(await bcrypt.compare('demo12345', passwordHash)).toBe(true);
    expect(res.user).not.toHaveProperty('passwordHash');
    expect((await jwt.verifyAsync(res.accessToken)).sub).toBe('u1');
  });

  it('rechaza un email ya registrado', async () => {
    const { auth } = setup({ passwordHash: 'x' });
    await expect(
      auth.register({ email: user.email, password: 'demo12345', name: 'Ana' }),
    ).rejects.toThrow(ConflictException);
  });

  it('inicia sesión sin exponer el hash', async () => {
    const { auth } = setup({ passwordHash: await bcrypt.hash('demo12345', 4) });
    const res = await auth.login({ email: user.email, password: 'demo12345' });
    expect(res.accessToken).toBeTruthy();
    expect(res.user).not.toHaveProperty('passwordHash');
  });

  it('da el mismo error si el email no existe o la contraseña es incorrecta', async () => {
    const wrong = setup({ passwordHash: await bcrypt.hash('otra-clave', 4) });
    const missing = setup();
    await expect(
      wrong.auth.login({ email: user.email, password: 'demo12345' }),
    ).rejects.toThrow('Email o contraseña incorrectos');
    await expect(
      missing.auth.login({ email: user.email, password: 'demo12345' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
