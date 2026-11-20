import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  AI_QUEUE,
  AiJob,
  defaultJobOptions,
  type MatchJobData,
  type TranscribeJobData,
  transcribeJobOptions,
} from '../queue/queue.constants.js';
import {
  AUDIO_MIME_TYPES,
  baseMimeType,
  isSupportedAudio,
  MAX_AUDIO_BYTES,
  VOICE_PLACEHOLDER,
} from '../ai/transcription.js';
import { CreateHelpRequestDto } from './dto/help-request.dto.js';

// Lo mínimo que se usa del archivo que entrega multer (FileInterceptor)
export interface UploadedAudio {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

const summarySelect = {
  id: true,
  text: true,
  area: true,
  topics: true,
  level: true,
  status: true,
  createdAt: true,
} as const;

@Injectable()
export class HelpRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(AI_QUEUE) private readonly queue: Queue,
  ) {}

  async create(authorId: string, dto: CreateHelpRequestDto) {
    const request = await this.prisma.helpRequest.create({
      data: { authorId, text: dto.text },
      select: { id: true, status: true },
    });
    await this.queue.add(
      AiJob.Match,
      { requestId: request.id } satisfies MatchJobData,
      defaultJobOptions,
    );
    return request;
  }

  // BE-04: la nota se transcribe en el worker (IA-05) y luego sigue el flujo normal
  async createFromVoice(authorId: string, audio: UploadedAudio | undefined) {
    if (!audio || audio.size === 0) {
      throw new BadRequestException(
        'Adjunta la nota de voz en el campo "audio"',
      );
    }
    if (!isSupportedAudio(audio.mimetype)) {
      throw new UnsupportedMediaTypeException(
        `Formato no soportado (${audio.mimetype}). Usa: ${AUDIO_MIME_TYPES.join(', ')}`,
      );
    }
    if (audio.size > MAX_AUDIO_BYTES) {
      throw new BadRequestException('La nota de voz pesa más de 10 MB');
    }
    const mimeType = baseMimeType(audio.mimetype);
    const request = await this.prisma.helpRequest.create({
      // audioPath guarda el formato; el audio no se almacena (se descarta al transcribir)
      data: { authorId, text: VOICE_PLACEHOLDER, audioPath: `voz:${mimeType}` },
      select: { id: true, status: true },
    });
    await this.queue.add(
      AiJob.Transcribe,
      {
        requestId: request.id,
        mimeType,
        audioBase64: audio.buffer.toString('base64'),
      } satisfies TranscribeJobData,
      transcribeJobOptions,
    );
    return request;
  }

  findMine(authorId: string) {
    return this.prisma.helpRequest.findMany({
      where: { authorId },
      select: summarySelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const request = await this.prisma.helpRequest.findUnique({
      where: { id },
      select: {
        ...summarySelect,
        authorId: true,
        rating: { select: { stars: true } },
        matches: {
          orderBy: { score: 'desc' },
          select: {
            id: true,
            score: true,
            explanation: true,
            status: true,
            helper: {
              select: {
                id: true,
                name: true,
                bio: true,
                tags: true,
                email: true,
              },
            },
          },
        },
      },
    });
    if (!request) throw new NotFoundException('La solicitud no existe');
    if (request.authorId !== userId)
      throw new ForbiddenException('Solo el autor ve esta solicitud');

    const { authorId: _authorId, matches, ...rest } = request;
    return {
      ...rest,
      // el email solo se muestra si acepto
      matches: matches.map(({ helper: { email, ...helper }, ...m }) => ({
        ...m,
        helper: m.status === 'ACCEPTED' ? { ...helper, email } : helper,
      })),
    };
  }

  async close(userId: string, id: string) {
    const request = await this.prisma.helpRequest.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!request) throw new NotFoundException('La solicitud no existe');
    if (request.authorId !== userId)
      throw new ForbiddenException('Solo el autor cierra esta solicitud');
    return this.prisma.helpRequest.update({
      where: { id },
      data: { status: 'CLOSED' },
      select: summarySelect,
    });
  }
}
