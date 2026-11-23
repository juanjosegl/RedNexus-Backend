import type { PrismaService } from '../../prisma/prisma.service.js';
import { StatsService } from './stats.service.js';

type Totals = {
  users: number;
  helpRequests: number;
  matched: number;
  acceptedHelps: number;
  average: number | null;
  areas: { area: string | null; _count: { _all: number } }[];
};

function setup(totals: Totals) {
  const prisma = {
    user: { count: vi.fn().mockResolvedValue(totals.users) },
    helpRequest: {
      count: vi.fn((args?: { where?: { status?: { in: string[] } } }) => {
        const statuses = args?.where?.status?.in;
        if (!statuses) return Promise.resolve(totals.helpRequests);
        if (statuses.includes('MATCHED'))
          return Promise.resolve(totals.matched);
        return Promise.resolve(totals.acceptedHelps);
      }),
      groupBy: vi.fn().mockResolvedValue(totals.areas),
    },
    rating: {
      aggregate: vi.fn().mockResolvedValue({ _avg: { stars: totals.average } }),
    },
  };
  const service = new StatsService(prisma as unknown as PrismaService);
  return { prisma, service };
}

const empty: Totals = {
  users: 0,
  helpRequests: 0,
  matched: 0,
  acceptedHelps: 0,
  average: null,
  areas: [],
};

describe('StatsService', () => {
  it('con la base vacía el porcentaje es 0 y el promedio es null', async () => {
    const { service } = setup(empty);
    await expect(service.summary()).resolves.toEqual({
      users: 0,
      helpRequests: 0,
      matchedPercent: 0,
      acceptedHelps: 0,
      averageRating: null,
      requestsByArea: [],
    });
  });

  it('calcula el porcentaje y el promedio con un decimal', async () => {
    const { prisma, service } = setup({
      users: 52,
      helpRequests: 130,
      matched: 120,
      acceptedHelps: 41,
      average: 4.64,
      areas: [{ area: 'bases-de-datos', _count: { _all: 30 } }],
    });

    await expect(service.summary()).resolves.toEqual({
      users: 52,
      helpRequests: 130,
      matchedPercent: 92.3,
      acceptedHelps: 41,
      averageRating: 4.6,
      requestsByArea: [{ area: 'bases-de-datos', count: 30 }],
    });

    expect(prisma.helpRequest.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ['area'],
        where: { area: { not: null } },
        take: 5,
      }),
    );
    expect(prisma.rating.aggregate).toHaveBeenCalledWith({
      _avg: { stars: true },
    });
  });

  it('deja fuera las áreas vacías y devuelve como mucho cinco', async () => {
    const { service } = setup({
      ...empty,
      helpRequests: 40,
      areas: [
        { area: null, _count: { _all: 99 } },
        { area: 'sql', _count: { _all: 4 } },
        { area: 'redes', _count: { _all: 8 } },
        { area: 'programacion', _count: { _all: 6 } },
        { area: 'calculo', _count: { _all: 2 } },
        { area: 'ingles', _count: { _all: 1 } },
        { area: 'bases-de-datos', _count: { _all: 10 } },
      ],
    });

    const stats = await service.summary();

    expect(stats.requestsByArea).toEqual([
      { area: 'bases-de-datos', count: 10 },
      { area: 'redes', count: 8 },
      { area: 'programacion', count: 6 },
      { area: 'sql', count: 4 },
      { area: 'calculo', count: 2 },
    ]);
  });
});
