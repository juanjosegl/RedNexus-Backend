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
      findMany: vi.fn().mockResolvedValue([]),
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

  it('consulta solo las calificaciones del ayudante y limita a 50', async () => {
    const { prisma, service } = setup(accepted);

    await service.received('ana');

    expect(prisma.rating.findMany).toHaveBeenCalledWith({
      where: { helperId: 'ana' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        stars: true,
        createdAt: true,
        request: {
          select: {
            id: true,
            text: true,
            area: true,
          },
        },
      },
    });
  });

  it('recorta el texto y no devuelve datos de quien calificó', async () => {
    const longText = 'A'.repeat(150);
    const { prisma, service } = setup(accepted);

    prisma.rating.findMany.mockResolvedValue([
      {
        stars: 5,
        createdAt: new Date('2026-11-22T10:00:00Z'),
        request: {
          id: 'r1',
          text: longText,
          area: 'bases-de-datos',
        },
      },
    ]);

    const result = await service.received('ana');

    expect(result[0].request).toEqual({
      requestId: 'r1',
      text: 'A'.repeat(120),
      area: 'bases-de-datos',
    });
    expect(result[0].request.text).toHaveLength(120);
    expect(result[0]).not.toHaveProperty('author');
    expect(result[0]).not.toHaveProperty('authorId');
  });

  it('devuelve una lista vacía si no hay calificaciones', async () => {
    const { service } = setup(accepted);

    await expect(
      service.received('usuario-sin-calificaciones'),
    ).resolves.toEqual([]);
  });
});
