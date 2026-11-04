export const TOP_K = 3;
export const CANDIDATE_POOL = 10;

// TODO: ajustar pesos con MLflow (IA-07)
export const SIMILARITY_WEIGHT = 0.8;
// sin calificaciones cuenta como 3/5
export const NEUTRAL_RATING = 3;
// calibrado con el mock, revisar con nomic-embed-text
export const MIN_SIMILARITY = 0.15;

export interface Candidate {
  id: string;
  name: string;
  bio: string | null;
  tags: string[];
  similarity: number; // 0 a 1
  avgRating: number | null; // 1 a 5
}

export function score(candidate: Candidate): number {
  const rating = (candidate.avgRating ?? NEUTRAL_RATING) / 5;
  return (
    SIMILARITY_WEIGHT * candidate.similarity + (1 - SIMILARITY_WEIGHT) * rating
  );
}

export function rank(candidates: Candidate[], authorId: string, k = TOP_K) {
  return candidates
    .filter((c) => c.id !== authorId && c.similarity >= MIN_SIMILARITY)
    .map((c) => ({ ...c, score: Number(score(c).toFixed(4)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
