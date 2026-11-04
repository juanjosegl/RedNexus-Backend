import { ConflictException, ForbiddenException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { MatchesService } from './matches.service.js';

function setup(match: object | null, takenCount = 1) {
  const prisma: Record<string, any> = {
    match: {
      findUnique: vi.fn().mockResolvedValue(match),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    helpRequest: {
      updateMany: vi.fn().mockResolvedValue({ count: takenCount }),
      findUniqueOrThrow: vi
        .fn()
        .mockResolvedValue({ author: { email: 'autor@rednexus.dev' } }),
    },
  };
  prisma.$transaction = vi.fn((fn) => fn(prisma));
  const service = new MatchesService(prisma as unknown as PrismaService);
  return { prisma, service };
}

const proposed = { helperId: 'ana', requestId: 'r1', status: 'PROPOSED' };

describe('MatchesService', () => {
  it('al aceptar devuelve el email del autor y marca todo como ACCEPTED', async () => {
    const { prisma, service } = setup(proposed);
    expect(await service.accept('ana', 'm1')).toEqual({
      authorEmail: 'autor@rednexus.dev',
    });
    expect(prisma.helpRequest.updateMany).toHaveBeenCalledWith({
      where: { id: 'r1', status: 'MATCHED' },
      data: { status: 'ACCEPTED' },
    });
    expect(prisma.match.updateMany).toHaveBeenCalledWith({
      where: { id: 'm1', status: 'PROPOSED' },
      data: { status: 'ACCEPTED' },
    });
  });

  it('responde 409 si otro ayudante ya la acepto', async () => {
    const { prisma, service } = setup(proposed, 0);
    await expect(service.accept('ana', 'm1')).rejects.toThrow(
      ConflictException,
    );
    expect(prisma.match.updateMany).not.toHaveBeenCalled();
  });

  it('nadie responde por otro candidato', async () => {
    const { service } = setup(proposed);
    await expect(service.accept('luis', 'm1')).rejects.toThrow(
      ForbiddenException,
    );
    await expect(service.reject('luis', 'm1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('solo se responde una vez', async () => {
    const { service } = setup({ ...proposed, status: 'REJECTED' });
    await expect(service.accept('ana', 'm1')).rejects.toThrow(
      'Ya respondiste a esta solicitud',
    );
    await expect(service.reject('ana', 'm1')).rejects.toThrow(
      ConflictException,
    );
  });

  it('rechazar deja el candidato en REJECTED', async () => {
    const { prisma, service } = setup(proposed);
    expect(await service.reject('ana', 'm1')).toEqual({
      id: 'm1',
      status: 'REJECTED',
    });
    expect(prisma.match.updateMany).toHaveBeenCalledWith({
      where: { id: 'm1', status: 'PROPOSED' },
      data: { status: 'REJECTED' },
    });
  });
});
