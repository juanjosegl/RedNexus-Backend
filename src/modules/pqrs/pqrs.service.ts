import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreatePqrsDto, PqrsDto } from './dto/pqrs.dto.js';

const select = {
  id: true,
  number: true,
  authorId: true,
  type: true,
  subject: true,
  description: true,
  status: true,
  response: true,
  respondedAt: true,
  createdAt: true,
} as const;

type PqrsRow = {
  [K in keyof typeof select]: K extends keyof PqrsDto
    ? PqrsDto[K]
    : K extends 'number'
      ? number
      : string;
};

export function radicado(number: number): string {
  return `PQRS-${String(number).padStart(6, '0')}`;
}

function toDto({ number, authorId: _author, ...rest }: PqrsRow): PqrsDto {
  return { ...rest, radicado: radicado(number) };
}

@Injectable()
export class PqrsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(authorId: string, dto: CreatePqrsDto): Promise<PqrsDto> {
    const row = await this.prisma.pqrs.create({
      data: {
        authorId,
        type: dto.type,
        subject: dto.subject.trim(),
        description: dto.description.trim(),
      },
      select,
    });
    return toDto(row);
  }

  async findMine(authorId: string): Promise<PqrsDto[]> {
    const rows = await this.prisma.pqrs.findMany({
      where: { authorId },
      select,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toDto);
  }

  async findOne(userId: string, id: string): Promise<PqrsDto> {
    const row = await this.prisma.pqrs.findUnique({ where: { id }, select });
    if (!row) throw new NotFoundException('La PQRS no existe');
    if (row.authorId !== userId)
      throw new ForbiddenException('Solo el autor ve esta PQRS');
    return toDto(row);
  }
}
