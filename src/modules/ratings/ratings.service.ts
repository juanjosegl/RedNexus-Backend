import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateRatingDto } from './dto/rating.dto.js';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async rate(authorId: string, dto: CreateRatingDto) {
    const request = await this.prisma.helpRequest.findUnique({
      where: { id: dto.requestId },
      select: {
        authorId: true,
        status: true,
        rating: { select: { id: true } },
        matches: { where: { status: 'ACCEPTED' }, select: { helperId: true } },
      },
    });
    if (!request) throw new NotFoundException('La solicitud no existe');
    if (request.authorId !== authorId)
      throw new ForbiddenException('Solo el autor califica su solicitud');
    // aceptada, o cerrada despues de que alguien acepto
    const [accepted] = request.matches;
    if (!accepted || !['ACCEPTED', 'CLOSED'].includes(request.status))
      throw new ConflictException('Solo se califica una solicitud aceptada');
    if (request.rating)
      throw new ConflictException('Ya calificaste esta solicitud');

    try {
      return await this.prisma.rating.create({
        data: {
          requestId: dto.requestId,
          authorId,
          helperId: accepted.helperId,
          stars: dto.stars,
        },
        select: {
          id: true,
          requestId: true,
          helperId: true,
          stars: true,
          createdAt: true,
        },
      });
    } catch (error) {
      // dos envios al tiempo: el indice unico deja pasar solo uno
      if ((error as { code?: string }).code === 'P2002')
        throw new ConflictException('Ya calificaste esta solicitud');
      throw error;
    }
  }
}
