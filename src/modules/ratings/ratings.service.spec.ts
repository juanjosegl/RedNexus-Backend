import { ConflictException, ForbiddenException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { RatingsService } from './ratings.service.js';

const accepted = {
  authorId: 'autor',
  status: 'ACCEPTED',
  rating: null,
  matches: [{ helperId: 'ana' }],
};

function setup(request: object | null, createError?: object) {
  const prisma = {
    helpRequest: { findUnique: vi.fn().mockResolvedValue(request) },
    rating: {
      create: createError
        ? vi.fn().mockRejectedValue(createError)
        : vi.fn().mockResolvedValue({ id: 'c1', stars: 5 }),
    },
  };
  const service = new RatingsService(prisma as unknown as PrismaService);
  return { prisma, service };
}

describe('RatingsService', () => {
  it('califica al ayudante que acepto', async () => {
    const { prisma, service } = setup(accepted);
    await service.rate('autor', { requestId: 'r1', stars: 5 });
    expect(prisma.rating.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { requestId: 'r1', authorId: 'autor', helperId: 'ana', stars: 5 },
      }),
    );
  });

  it('solo el autor califica', async () => {
    const { service } = setup(accepted);
    await expect(
      service.rate('intruso', { requestId: 'r1', stars: 5 }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('solo solicitudes aceptadas', async () => {
    const { service } = setup({ ...accepted, status: 'MATCHED', matches: [] });
    await expect(
      service.rate('autor', { requestId: 'r1', stars: 4 }),
    ).rejects.toThrow('Solo se califica una solicitud aceptada');
  });

  it('una sola vez, aunque lleguen dos envios al tiempo', async () => {
    const already = setup({ ...accepted, rating: { id: 'c1' } });
    await expect(
      already.service.rate('autor', { requestId: 'r1', stars: 3 }),
    ).rejects.toThrow(ConflictException);

    const race = setup(accepted, { code: 'P2002' });
    await expect(
      race.service.rate('autor', { requestId: 'r1', stars: 3 }),
    ).rejects.toThrow('Ya calificaste esta solicitud');
  });
});
