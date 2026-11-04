import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  incoming(helperId: string) {
    return this.prisma.match.findMany({
      where: { helperId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        score: true,
        explanation: true,
        status: true,
        createdAt: true,
        request: {
          select: {
            id: true,
            text: true,
            area: true,
            topics: true,
            level: true,
            status: true,
            createdAt: true,
            author: { select: { name: true } },
          },
        },
      },
    });
  }
}
