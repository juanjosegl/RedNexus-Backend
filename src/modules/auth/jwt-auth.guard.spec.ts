import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard.js';

const jwt = new JwtService({ secret: 'prueba' });

function context(authorization?: string, isPublic = false) {
  const request: Record<string, any> = { headers: { authorization } };
  const reflector = {
    getAllAndOverride: () => isPublic,
  } as unknown as Reflector;
  const ctx = {
    getHandler: () => null,
    getClass: () => null,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { guard: new JwtAuthGuard(jwt, reflector), ctx, request };
}

describe('JwtAuthGuard', () => {
  it('deja pasar las rutas @Public() sin token', async () => {
    const { guard, ctx } = context(undefined, true);
    expect(await guard.canActivate(ctx)).toBe(true);
  });

  it('responde 401 sin token o con un token inválido', async () => {
    await expect(context().guard.canActivate(context().ctx)).rejects.toThrow(
      UnauthorizedException,
    );
    const bad = context('Bearer no-es-un-jwt');
    await expect(bad.guard.canActivate(bad.ctx)).rejects.toThrow(
      'Token inválido o vencido',
    );
  });

  it('con un token válido deja el usuario en la petición', async () => {
    const token = await jwt.signAsync({ sub: 'u1', email: 'a@rednexus.dev' });
    const { guard, ctx, request } = context(`Bearer ${token}`);
    expect(await guard.canActivate(ctx)).toBe(true);
    expect(request.user).toMatchObject({ sub: 'u1' });
  });
});
