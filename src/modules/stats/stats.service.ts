import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { StatsDto } from './dto/stats.dto.js';

const MATCHED = ['MATCHED', 'ACCEPTED', 'CLOSED'] as const;
const ACCEPTED = ['ACCEPTED', 'CLOSED'] as const;

function oneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

type AreaRow = { area: string | null; _count: { _all: number } };

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(): Promise<StatsDto> {
    const [users, helpRequests, matched, acceptedHelps, rating, areas] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.helpRequest.count(),
        this.prisma.helpRequest.count({
          where: { status: { in: [...MATCHED] } },
        }),
        this.prisma.helpRequest.count({
          where: { status: { in: [...ACCEPTED] } },
        }),
        this.prisma.rating.aggregate({ _avg: { stars: true } }),
        this.prisma.helpRequest.groupBy({
          by: ['area'],
          where: { area: { not: null } },
          _count: { _all: true },
          orderBy: { _count: { area: 'desc' } },
          take: 5,
        }),
      ]);

    return {
      users,
      helpRequests,
      matchedPercent:
        helpRequests === 0 ? 0 : oneDecimal((matched / helpRequests) * 100),
      acceptedHelps,
      averageRating:
        rating._avg.stars === null ? null : oneDecimal(rating._avg.stars),
      requestsByArea: (areas as AreaRow[])
        .flatMap((row) =>
          row.area === null ? [] : [{ area: row.area, count: row._count._all }],
        )
        .toSorted((a, b) => b.count - a.count)
        .slice(0, 5),
    };
  }
}
