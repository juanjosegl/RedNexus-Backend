import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  AI_PROVIDER,
  type AiProvider,
  profileText,
} from '../ai/ai-provider.js';
import { toPgVector } from '../ai/text.js';

@Injectable()
export class MatchingService {
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
}
