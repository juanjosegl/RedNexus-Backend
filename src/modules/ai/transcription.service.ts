import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  AI_QUEUE,
  AiJob,
  defaultJobOptions,
  type MatchJobData,
  type TranscribeJobData,
} from '../queue/queue.constants.js';
import {
  TRANSCRIBER,
  type Transcriber,
  VOICE_PLACEHOLDER,
} from './transcription.js';
import { withTraceContext } from '../../telemetry/instruments.js';

// mínimo que exige una solicitud por texto (CreateHelpRequestDto)
const MIN_TEXT = 10;
const MAX_TEXT = 1000;

export const UNINTELLIGIBLE_TEXT =
  'No se entendió la nota de voz. Vuelve a publicar tu duda por texto o graba otra nota con menos ruido.';

export interface TranscribeResult {
  requestId: string;
  outcome: 'transcribed' | 'unintelligible' | 'skipped';
  chars: number;
  ms: number;
}

// Corre en el worker: nota de voz -> texto -> trabajo de emparejamiento (IA-05)
@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(TRANSCRIBER) private readonly transcriber: Transcriber,
    @InjectQueue(AI_QUEUE) private readonly queue: Queue,
  ) {}

  async transcribeRequest(job: TranscribeJobData): Promise<TranscribeResult> {
    const started = Date.now();
    const request = await this.prisma.helpRequest.findUnique({
      where: { id: job.requestId },
      select: { id: true, text: true, status: true },
    });
    // reintento de un trabajo ya transcrito: no hacer nada
    if (
      !request ||
      request.status !== 'PENDING' ||
      request.text !== VOICE_PLACEHOLDER
    ) {
      return {
        requestId: job.requestId,
        outcome: 'skipped',
        chars: 0,
        ms: 0,
      };
    }

    const text = (
      await this.transcriber.transcribe(
        Buffer.from(job.audioBase64, 'base64'),
        job.mimeType,
      )
    )
      .trim()
      .slice(0, MAX_TEXT);

    if (text.length < MIN_TEXT) {
      // sin texto útil no hay qué emparejar: se cierra y se le explica al autor
      await this.prisma.helpRequest.update({
        where: { id: request.id },
        data: { text: UNINTELLIGIBLE_TEXT, status: 'CLOSED' },
      });
      this.logger.warn(
        `Solicitud ${request.id}: la nota de voz no tiene texto útil (${this.transcriber.name})`,
      );
      return {
        requestId: request.id,
        outcome: 'unintelligible',
        chars: text.length,
        ms: Date.now() - started,
      };
    }

    await this.prisma.helpRequest.update({
      where: { id: request.id },
      data: { text },
    });
    await this.queue.add(
      AiJob.Match,
      withTraceContext({ requestId: request.id } satisfies MatchJobData),
      defaultJobOptions,
    );
    const ms = Date.now() - started;
    this.logger.log(
      `Solicitud ${request.id}: nota de voz transcrita (${text.length} caracteres) en ${ms} ms con ${this.transcriber.name}`,
    );
    return {
      requestId: request.id,
      outcome: 'transcribed',
      chars: text.length,
      ms,
    };
  }
}
