import type { Queue } from 'bullmq';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { AiJob } from '../queue/queue.constants.js';
import { UsersService } from './users.service.js';

const user = {
  id: 'u1',
  email: 'ana.demo@rednexus.dev',
  name: 'Ana',
  bio: 'Sé SQL',
  tags: ['sql'],
};

function setup(avg: number | null = null) {
  const prisma = {
    user: {
      findUnique: vi.fn().mockResolvedValue(user),
      update: vi.fn(),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    rating: {
      aggregate: vi.fn().mockResolvedValue({ _avg: { stars: avg } }),
    },
  };
  const queue = { add: vi.fn() };
  const service = new UsersService(
    prisma as unknown as PrismaService,
    queue as unknown as Queue,
  );
  return { prisma, queue, service };
}

describe('UsersService', () => {
  it('incluye el promedio de calificaciones en mi perfil', async () => {
    const { service } = setup(4.333);
    expect(await service.me('u1')).toMatchObject({
      email: user.email,
      rating: 4.33,
    });
  });

  it('encola el embedding si cambian la bio o las etiquetas', async () => {
    const { queue, service } = setup();
    await service.update('u1', { bio: 'Sé SQL y joins' });
    expect(queue.add).toHaveBeenCalledWith(
      AiJob.EmbedProfile,
      { userId: 'u1' },
      expect.any(Object),
    );
  });

  it('no encola nada si solo cambia el nombre', async () => {
    const { queue, service } = setup();
    await service.update('u1', { name: 'Ana Gómez' });
    expect(queue.add).not.toHaveBeenCalled();
  });

  it('pide el perfil público sin el email', async () => {
    const { prisma, service } = setup();
    await service.publicProfile('u1');
    const { select } = prisma.user.findUnique.mock.calls[0][0];
    expect(select).not.toHaveProperty('email');
  });

  it('exporta todos mis datos sin contraseña ni embedding', async () => {
    const { prisma, service } = setup();
    prisma.user.findUnique.mockResolvedValue({
      ...user,
      consentAt: new Date('2026-11-01'),
      createdAt: new Date('2026-11-01'),
      requests: [{ id: 'r1', text: 'No entiendo los joins' }],
      matches: [],
      ratingsGiven: [],
      ratingsGot: [{ requestId: 'r9', stars: 5 }],
      pqrs: [],
    });
    const data = await service.exportData('u1');
    expect(data.profile).toMatchObject({ email: user.email });
    expect(data.helpRequests).toHaveLength(1);
    expect(data.ratingsReceived).toEqual([{ requestId: 'r9', stars: 5 }]);
    const select = prisma.user.findUnique.mock.calls[0][0].select;
    expect(select).not.toHaveProperty('passwordHash');
    expect(select).not.toHaveProperty('embedding');
  });

  it('elimina la cuenta (la base borra en cascada lo asociado)', async () => {
    const { prisma, service } = setup();
    await service.deleteAccount('u1');
    expect(prisma.user.deleteMany).toHaveBeenCalledWith({
      where: { id: 'u1' },
    });
    prisma.user.deleteMany.mockResolvedValue({ count: 0 });
    await expect(service.deleteAccount('u1')).rejects.toThrow('no existe');
  });
});
