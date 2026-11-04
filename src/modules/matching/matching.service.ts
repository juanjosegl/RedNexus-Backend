import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  AI_PROVIDER,
  type AiProvider,
  type Classification,
  profileText,
} from '../ai/ai-provider.js';
import { MockAiProvider } from '../ai/providers/mock.provider.js';
import { overlap, tokenize, toPgVector } from '../ai/text.js';
import { CANDIDATE_POOL, type Candidate, rank } from './ranking.js';

export interface MatchResult {
  requestId: string;
  strategy: 'semantic' | 'tags' | 'skipped';
  candidates: number;
  ms: number;
}

// explicacion de respaldo si el LLM falla
const fallbackExplainer = new MockAiProvider();

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

  async matchRequest(requestId: string): Promise<MatchResult> {
    const started = Date.now();
    const request = await this.prisma.helpRequest.findUnique({
      where: { id: requestId },
    });
    // ya emparejada (reintento): no hacer nada
    if (!request || request.status !== 'PENDING') {
      return { requestId, strategy: 'skipped', candidates: 0, ms: 0 };
    }

    const classification = await this.tryOrNull('clasificar la solicitud', () =>
      this.ai.classify(request.text),
    );
    const embedding = await this.tryOrNull('calcular el embedding', () =>
      this.ai.embed(request.text),
    );

    let strategy: MatchResult['strategy'] = 'semantic';
    let pool: Candidate[] = [];
    if (embedding) {
      await this.prisma.$executeRaw`
        UPDATE "HelpRequest" SET embedding = ${toPgVector(embedding)}::vector WHERE id = ${requestId}`;
      pool = await this.semanticCandidates(embedding, request.authorId);
    }
    // sin IA o sin perfiles indexados -> respaldo por etiquetas
    if (pool.length === 0) {
      strategy = 'tags';
      pool = await this.tagCandidates(
        request.text,
        classification,
        request.authorId,
      );
    }

    const top = rank(pool, request.authorId);
    const explanations = await Promise.all(
      top.map(
        async (c) =>
          (await this.tryOrNull('explicar el candidato', () =>
            this.ai.explain(request.text, c),
          )) ?? (await fallbackExplainer.explain(request.text, c)),
      ),
    );

    await this.prisma.$transaction([
      this.prisma.match.createMany({
        data: top.map((c, i) => ({
          requestId,
          helperId: c.id,
          score: c.score,
          explanation: explanations[i],
        })),
        skipDuplicates: true,
      }),
      this.prisma.helpRequest.update({
        where: { id: requestId },
        data: {
          status: 'MATCHED',
          area: classification?.area,
          topics: classification?.topics ?? [],
          level: classification?.level,
        },
      }),
    ]);

    const result = {
      requestId,
      strategy,
      candidates: top.length,
      ms: Date.now() - started,
    };
    this.logger.log(
      `Solicitud ${requestId}: ${result.candidates} candidatos por ${strategy} en ${result.ms} ms (IA: ${this.ai.name})`,
    );
    return result;
  }

  // top 10 por distancia coseno
  private semanticCandidates(embedding: number[], authorId: string) {
    const vector = toPgVector(embedding);
    return this.prisma.$queryRaw<Candidate[]>`
      SELECT u.id, u.name, u.bio, u.tags,
             (1 - (u.embedding <=> ${vector}::vector))::float AS similarity,
             (SELECT AVG(r.stars)::float FROM "Rating" r WHERE r."helperId" = u.id) AS "avgRating"
      FROM "User" u
      WHERE u.embedding IS NOT NULL AND u.id <> ${authorId}
      ORDER BY u.embedding <=> ${vector}::vector
      LIMIT ${CANDIDATE_POOL}`;
  }

  // respaldo: % de palabras de la solicitud que estan en bio/etiquetas
  private async tagCandidates(
    text: string,
    classification: Classification | null,
    authorId: string,
  ) {
    const wanted = tokenize(
      [text, classification?.area, ...(classification?.topics ?? [])].join(' '),
    );
    if (wanted.length === 0) return [];
    const users = await this.prisma.user.findMany({
      where: { id: { not: authorId } },
      select: {
        id: true,
        name: true,
        bio: true,
        tags: true,
        ratingsGot: { select: { stars: true } },
      },
    });
    return users
      .map(({ ratingsGot, ...u }) => ({
        ...u,
        similarity:
          overlap(wanted, tokenize(`${u.bio ?? ''} ${u.tags.join(' ')}`))
            .length / wanted.length,
        avgRating: ratingsGot.length
          ? ratingsGot.reduce((s, r) => s + r.stars, 0) / ratingsGot.length
          : null,
      }))
      .filter((c) => c.similarity > 0);
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
