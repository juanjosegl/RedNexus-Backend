import type { PrismaService } from '../../prisma/prisma.service.js';
import type { AiProvider } from '../ai/ai-provider.js';
import { MatchingService } from './matching.service.js';

const profiles = [
  {
    id: 'ana',
    name: 'Ana',
    bio: 'Sé SQL y joins entre tablas',
    tags: ['bases-de-datos'],
    ratingsGot: [],
  },
  {
    id: 'sofia',
    name: 'Sofía',
    bio: 'Cálculo e integrales',
    tags: ['matematicas'],
    ratingsGot: [],
  },
];

function setup(ai: Partial<AiProvider>) {
  const prisma = {
    helpRequest: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'r1',
        authorId: 'autor',
        text: 'No entiendo los joins en SQL',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 1500),
      }),
      update: vi.fn(),
    },
    match: { createMany: vi.fn() },
    user: { findMany: vi.fn().mockResolvedValue(profiles) },
    $executeRaw: vi.fn(),
    $queryRaw: vi.fn().mockResolvedValue([]),
    $transaction: vi.fn(),
  };
  const service = new MatchingService(
    prisma as unknown as PrismaService,
    { name: 'prueba', ...ai } as AiProvider,
  );
  return { prisma, service };
}

describe('MatchingService', () => {
  it('con el nodo de IA caído empareja por etiquetas y explica sin LLM', async () => {
    const down = () => Promise.reject(new Error('ECONNREFUSED'));
    const { prisma, service } = setup({
      embed: down,
      classify: down,
      explain: down,
    });

    const result = await service.matchRequest('r1');

    expect(result).toMatchObject({ strategy: 'tags', candidates: 1 });
    // PL-07: la latencia del SLO se mide desde que se creó la solicitud
    expect(result.latencyMs).toBeGreaterThanOrEqual(1500);
    const [match] = prisma.match.createMany.mock.calls[0][0].data;
    expect(match).toMatchObject({ requestId: 'r1', helperId: 'ana' });
    expect(match.explanation).toContain('sql');
    expect(prisma.helpRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'MATCHED' }),
      }),
    );
  });

  it('no vuelve a emparejar una solicitud que ya no está PENDING', async () => {
    const { prisma, service } = setup({});
    prisma.helpRequest.findUnique.mockResolvedValue({
      id: 'r1',
      status: 'MATCHED',
    });
    expect((await service.matchRequest('r1')).strategy).toBe('skipped');
    expect(prisma.match.createMany).not.toHaveBeenCalled();
  });

  it('si la IA responde pero nadie supera el umbral, no propone a nadie', async () => {
    const vector = Array.from({ length: 768 }, () => 0.01);
    const { prisma, service } = setup({
      embed: () => Promise.resolve(vector),
      classify: () =>
        Promise.resolve({ area: 'general', topics: [], level: 'basico' }),
      explain: () => Promise.resolve('x'),
    });
    prisma.$queryRaw.mockResolvedValue([
      { ...profiles[1], similarity: 0.05, avgRating: null },
    ]);
    prisma.helpRequest.findUnique.mockResolvedValue({
      id: 'r1',
      authorId: 'autor',
      text: 'Cómo preparo una lasaña de carne',
      status: 'PENDING',
      createdAt: new Date(),
    });

    const result = await service.matchRequest('r1');

    expect(result).toMatchObject({ strategy: 'semantic', candidates: 0 });
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });
});
