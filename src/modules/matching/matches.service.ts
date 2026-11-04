import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async accept(helperId: string, id: string) {
    const match = await this.findOwn(helperId, id);
    return this.prisma.$transaction(async (tx) => {
      // solo uno acepta: la solicitud pasa de MATCHED a ACCEPTED una sola vez
      const taken = await tx.helpRequest.updateMany({
        where: { id: match.requestId, status: 'MATCHED' },
        data: { status: 'ACCEPTED' },
      });
      if (taken.count === 0)
        throw new ConflictException('La solicitud ya fue aceptada o cerrada');
      const answered = await tx.match.updateMany({
        where: { id, status: 'PROPOSED' },
        data: { status: 'ACCEPTED' },
      });
      if (answered.count === 0)
        throw new ConflictException('Ya respondiste a esta solicitud');
      const { author } = await tx.helpRequest.findUniqueOrThrow({
        where: { id: match.requestId },
        select: { author: { select: { email: true } } },
      });
      return { authorEmail: author.email };
    });
  }

  async reject(helperId: string, id: string) {
    await this.findOwn(helperId, id);
    const answered = await this.prisma.match.updateMany({
      where: { id, status: 'PROPOSED' },
      data: { status: 'REJECTED' },
    });
    if (answered.count === 0)
      throw new ConflictException('Ya respondiste a esta solicitud');
    return { id, status: 'REJECTED' as const };
  }

  private async findOwn(helperId: string, id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      select: { helperId: true, requestId: true, status: true },
    });
    if (!match) throw new NotFoundException('El candidato no existe');
    if (match.helperId !== helperId)
      throw new ForbiddenException('Solo el candidato puede responder');
    if (match.status !== 'PROPOSED')
      throw new ConflictException('Ya respondiste a esta solicitud');
    return match;
  }
}
