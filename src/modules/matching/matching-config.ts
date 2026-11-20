// Configuración del emparejamiento elegida con los experimentos de MLflow (IA-07, ADR-010).
// La versión registrada es el modelo `rednexus-matching` de MLflow; ver
// RedNexus-Platform/ml/results/winning-config.json. Cada valor se puede cambiar por variable de
// entorno, así volver a una versión anterior es cambiar variables y reiniciar el worker.

export const MATCHING_CONFIG = Symbol('MATCHING_CONFIG');

export interface MatchingConfig {
  // versión de rednexus-matching en el registro de MLflow
  version: string;
  // peso de la similitud frente a la calificación (el resto es calificación / 5)
  similarityWeight: number;
  // similitud mínima para proponer a alguien por embeddings
  minSimilarity: number;
  // búsqueda híbrida: alpha * embedding + (1 - alpha) * coincidencia de palabras (1 = solo embedding)
  hybridAlpha: number;
  // agregar el área y los temas de la clasificación al texto que se convierte en embedding
  enrichQuery: boolean;
}

export const DEFAULT_MATCHING_CONFIG: MatchingConfig = {
  version: '1',
  similarityWeight: 0.8,
  minSimilarity: 0.25,
  hybridAlpha: 0.6,
  enrichQuery: true,
};

function num(value: string | undefined, fallback: number) {
  const parsed = value === undefined || value === '' ? NaN : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function matchingConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): MatchingConfig {
  const d = DEFAULT_MATCHING_CONFIG;
  return {
    version: env.MATCH_CONFIG_VERSION || d.version,
    similarityWeight: num(env.MATCH_SIMILARITY_WEIGHT, d.similarityWeight),
    minSimilarity: num(env.MATCH_MIN_SIMILARITY, d.minSimilarity),
    hybridAlpha: num(env.MATCH_HYBRID_ALPHA, d.hybridAlpha),
    enrichQuery:
      env.MATCH_ENRICH_QUERY === undefined || env.MATCH_ENRICH_QUERY === ''
        ? d.enrichQuery
        : env.MATCH_ENRICH_QUERY === 'true',
  };
}
