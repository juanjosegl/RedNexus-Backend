import { DEFAULT_MATCHING_CONFIG } from './matching-config.js';

export const TOP_K = 3;
export const CANDIDATE_POOL = 10;

// Valores por defecto: los de la configuración ganadora de IA-07 (matching-config.ts)
export const SIMILARITY_WEIGHT = DEFAULT_MATCHING_CONFIG.similarityWeight;
export const MIN_SIMILARITY = DEFAULT_MATCHING_CONFIG.minSimilarity;
// sin calificaciones cuenta como 3/5
export const NEUTRAL_RATING = 3;

export interface Candidate {
  id: string;
  name: string;
  bio: string | null;
  tags: string[];
  similarity: number; // 0 a 1
  avgRating: number | null; // 1 a 5
}

export interface RankingOptions {
  similarityWeight: number;
  minSimilarity: number;
}

const DEFAULT_OPTIONS: RankingOptions = {
  similarityWeight: SIMILARITY_WEIGHT,
  minSimilarity: MIN_SIMILARITY,
};

export function score(
  candidate: Candidate,
  weight = SIMILARITY_WEIGHT,
): number {
  const rating = (candidate.avgRating ?? NEUTRAL_RATING) / 5;
  return weight * candidate.similarity + (1 - weight) * rating;
}

export function rank(
  candidates: Candidate[],
  authorId: string,
  k = TOP_K,
  options: RankingOptions = DEFAULT_OPTIONS,
) {
  return candidates
    .filter((c) => c.id !== authorId && c.similarity >= options.minSimilarity)
    .map((c) => ({
      ...c,
      score: Number(score(c, options.similarityWeight).toFixed(4)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

// Búsqueda híbrida (IA-07): mezcla la similitud del embedding con la coincidencia de palabras
export function hybridSimilarity(
  semantic: number,
  lexical: number,
  alpha: number,
): number {
  return alpha * semantic + (1 - alpha) * lexical;
}
