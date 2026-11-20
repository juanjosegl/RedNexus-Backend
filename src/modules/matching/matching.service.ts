import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  AI_PROVIDER,
  type AiProvider,
  type Classification,
  profileText,
} from '../ai/ai-provider.js';
import { MockAiProvider } from '../ai/providers/mock.provider.js';
import { lexicalSimilarity, toPgVector } from '../ai/text.js';
import {
  DEFAULT_MATCHING_CONFIG,
  MATCHING_CONFIG,
  type MatchingConfig,
} from './matching-config.js';
import {
  CANDIDATE_POOL,
  type Candidate,
  hybridSimilarity,
  rank,
} from './ranking.js';

export interface MatchResult {
  requestId: string;
  strategy: 'semantic' | 'tags' | 'skipped';
  configVersion?: string;
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
    @Optional()
    @Inject(MATCHING_CONFIG)
    private readonly config: MatchingConfig = DEFAULT_MATCHING_CONFIG,
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
    // IA-07: el área y los temas de la clasificación mejoran la búsqueda (precision@3 0,83 -> 0,89)
    const query = queryText(request.text, classification, this.config);
    const embedding = await this.tryOrNull('calcular el embedding', () =>
      this.ai.embed(query),
    );

    let strategy: MatchResult['strategy'] = 'semantic';
    let top: (Candidate & { score: number })[] = [];
    if (embedding) {
      await this.prisma.$executeRaw`
        UPDATE "HelpRequest" SET embedding = ${toPgVector(embedding)}::vector WHERE id = ${requestId}`;
      const pool = (
        await this.semanticCandidates(embedding, request.authorId)
      ).map((c) => ({
        ...c,
        similarity: hybridSimilarity(
          c.similarity,
          lexicalSimilarity(query, profileText(c)),
          this.config.hybridAlpha,
        ),
      }));
      top = rank(pool, request.authorId, undefined, this.config);
    }
    // sin IA, sin perfiles indexados o nadie supera el umbral -> respaldo por etiquetas
    if (top.length === 0) {
      strategy = 'tags';
      const pool = await this.tagCandidates(
        queryText(request.text, classification, { enrichQuery: true }),
        request.authorId,
      );
      top = rank(pool, request.authorId, undefined, {
        similarityWeight: this.config.similarityWeight,
        minSimilarity: 0, // tagCandidates ya descarta a quien no comparte ninguna palabra
      });
    }
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
      configVersion: this.config.version,
      candidates: top.length,
      ms: Date.now() - started,
    };
    this.logger.log(
      `Solicitud ${requestId}: ${result.candidates} candidatos por ${strategy} en ${result.ms} ms (IA: ${this.ai.name}, rednexus-matching v${this.config.version})`,
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

  // respaldo: % de palabras de la solicitud (y de su clasificación) que están en bio/etiquetas
  private async tagCandidates(query: string, authorId: string) {
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
        similarity: lexicalSimilarity(query, profileText(u)),
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

// Texto que se convierte en embedding: la duda y, si hay, su clasificación
export function queryText(
  text: string,
  classification: Classification | null,
  config: Pick<MatchingConfig, 'enrichQuery'>,
): string {
  if (!classification || !config.enrichQuery) return text;
  const topics = classification.topics.length
    ? ` Temas: ${classification.topics.join(', ')}`
    : '';
  return `${text}\nÁrea: ${classification.area}.${topics}`;
}
