import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  AI_PROVIDER,
  type AiProvider,
  profileText,
} from '../ai/ai-provider.js';
import { toPgVector } from '../ai/text.js';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(AI_PROVIDER) private readonly ai: AiProvider,
  ) {}

  async indexProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;
    const text = profileText(user);
    if (!text.trim()) return;
    const embedding = await this.ai.embed(text);
    await this.prisma.$executeRaw`
      UPDATE "User" SET embedding = ${toPgVector(embedding)}::vector WHERE id = ${userId}`;
  }

  async matchRequest(requestId: string) {
    const request = await this.prisma.helpRequest.findUnique({
      where: { id: requestId },
    });
    // ya emparejada (reintento): no hacer nada
    if (!request || request.status !== 'PENDING') return;

    const classification = await this.tryOrNull('clasificar la solicitud', () =>
      this.ai.classify(request.text),
    );
    const embedding = await this.tryOrNull('calcular el embedding', () =>
      this.ai.embed(request.text),
    );
    if (embedding) {
      await this.prisma.$executeRaw`
        UPDATE "HelpRequest" SET embedding = ${toPgVector(embedding)}::vector WHERE id = ${requestId}`;
    }
    if (classification) {
      await this.prisma.helpRequest.update({
        where: { id: requestId },
        data: classification,
      });
    }
    this.logger.log(
      `Solicitud ${requestId}: área ${classification?.area ?? 'sin clasificar'}, embedding ${embedding ? 'calculado' : 'pendiente'} (IA: ${this.ai.name})`,
    );
  }

  private async tryOrNull<T>(
    action: string,
    fn: () => Promise<T>,
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.logger.warn(
        `No se pudo ${action} con ${this.ai.name}: ${(error as Error).message}`,
      );
      return null;
    }
  }
}
