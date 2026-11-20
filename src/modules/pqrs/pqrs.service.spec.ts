import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { PqrsService, radicado } from './pqrs.service.js';

const row = {
  id: 'p1',
  number: 7,
  authorId: 'autor',
  type: 'QUEJA',
  subject: 'No llegan candidatos',
  description: 'Mi solicitud sigue en pendiente desde ayer.',
  status: 'RADICADA',
  response: null,
  respondedAt: null,
  createdAt: new Date('2026-11-19T12:00:00Z'),
};

function setup(found: object | null = row) {
  const prisma = {
    pqrs: {
      create: vi.fn().mockResolvedValue(row),
      findMany: vi.fn().mockResolvedValue([row]),
      findUnique: vi.fn().mockResolvedValue(found),
    },
  };
  const service = new PqrsService(prisma as unknown as PrismaService);
  return { prisma, service };
}

describe('radicado', () => {
  it('rellena el número con ceros', () => {
    expect(radicado(7)).toBe('PQRS-000007');
    expect(radicado(1234567)).toBe('PQRS-1234567');
  });
});

describe('PqrsService', () => {
  it('radica la PQRS del usuario sin espacios sobrantes', async () => {
    const { prisma, service } = setup();

    const created = await service.create('autor', {
      type: 'QUEJA',
      subject: '  No llegan candidatos ',
      description: ' Mi solicitud sigue en pendiente desde ayer. ',
    });

    expect(prisma.pqrs.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          authorId: 'autor',
          type: 'QUEJA',
          subject: 'No llegan candidatos',
          description: 'Mi solicitud sigue en pendiente desde ayer.',
        },
      }),
    );
    expect(created.radicado).toBe('PQRS-000007');
    expect(created).not.toHaveProperty('authorId');
    expect(created).not.toHaveProperty('number');
  });

  it('lista solo las del usuario', async () => {
    const { prisma, service } = setup();
    const mine = await service.findMine('autor');
    expect(prisma.pqrs.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { authorId: 'autor' } }),
    );
    expect(mine[0].radicado).toBe('PQRS-000007');
  });

  it('solo el autor ve el detalle', async () => {
    const { service } = setup();
    await expect(service.findOne('otro', 'p1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('404 si no existe', async () => {
    const { service } = setup(null);
    await expect(service.findOne('autor', 'p1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
