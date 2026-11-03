import { ForbiddenException } from '@nestjs/common';
import type { Queue } from 'bullmq';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { AiJob } from '../queue/queue.constants.js';
import { HelpRequestsService } from './help-requests.service.js';

const helper = (id: string) => ({
  id,
  name: id,
  bio: null,
  tags: [],
  email: `${id}@rednexus.dev`,
});

function setup() {
  const prisma = {
    helpRequest: {
      create: vi.fn().mockResolvedValue({ id: 'r1', status: 'PENDING' }),
      findUnique: vi.fn().mockResolvedValue({
        id: 'r1',
        authorId: 'autor',
        text: 'No entiendo los joins',
        matches: [
          {
            id: 'm1',
            score: 0.9,
            explanation: null,
            status: 'ACCEPTED',
            helper: helper('ana'),
          },
          {
            id: 'm2',
            score: 0.5,
            explanation: null,
            status: 'PROPOSED',
            helper: helper('luis'),
          },
        ],
      }),
    },
  };
  const queue = { add: vi.fn() };
  const service = new HelpRequestsService(
    prisma as unknown as PrismaService,
    queue as unknown as Queue,
  );
  return { prisma, queue, service };
}

describe('HelpRequestsService', () => {
  it('crea la solicitud y encola el emparejamiento', async () => {
    const { queue, service } = setup();
    expect(
      await service.create('autor', { text: 'No entiendo los joins' }),
    ).toEqual({ id: 'r1', status: 'PENDING' });
    expect(queue.add).toHaveBeenCalledWith(
      AiJob.Match,
      { requestId: 'r1' },
      expect.any(Object),
    );
  });

  it('solo comparte el email de quien aceptó', async () => {
    const { service } = setup();
    const detail = await service.findOne('autor', 'r1');
    expect(detail.matches[0].helper).toHaveProperty(
      'email',
      'ana@rednexus.dev',
    );
    expect(detail.matches[1].helper).not.toHaveProperty('email');
    expect(detail).not.toHaveProperty('authorId');
  });

  it('no deja ver solicitudes ajenas', async () => {
    const { service } = setup();
    await expect(service.findOne('intruso', 'r1')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
