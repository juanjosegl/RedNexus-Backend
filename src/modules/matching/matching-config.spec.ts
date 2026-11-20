import { Classification } from '../ai/ai-provider.js';
import { lexicalSimilarity } from '../ai/text.js';
import {
  DEFAULT_MATCHING_CONFIG,
  matchingConfigFromEnv,
} from './matching-config.js';
import { queryText } from './matching.service.js';
import { hybridSimilarity, rank } from './ranking.js';

const classification: Classification = {
  area: 'bases-de-datos',
  topics: ['joins', 'sql'],
  level: 'intermedio',
};

describe('configuración del emparejamiento (IA-07)', () => {
  it('usa la configuración ganadora si no hay variables', () => {
    expect(matchingConfigFromEnv({})).toEqual(DEFAULT_MATCHING_CONFIG);
  });

  it('las variables de entorno cambian la versión desplegada', () => {
    expect(
      matchingConfigFromEnv({
        MATCH_CONFIG_VERSION: '0',
        MATCH_SIMILARITY_WEIGHT: '0.8',
        MATCH_MIN_SIMILARITY: '0.15',
        MATCH_HYBRID_ALPHA: '1',
        MATCH_ENRICH_QUERY: 'false',
      }),
    ).toEqual({
      version: '0',
      similarityWeight: 0.8,
      minSimilarity: 0.15,
      hybridAlpha: 1,
      enrichQuery: false,
    });
  });

  it('ignora valores que no son números', () => {
    expect(
      matchingConfigFromEnv({ MATCH_SIMILARITY_WEIGHT: 'mucho' })
        .similarityWeight,
    ).toBe(DEFAULT_MATCHING_CONFIG.similarityWeight);
  });

  it('enriquece la consulta con el área y los temas', () => {
    expect(
      queryText('No entiendo los joins', classification, { enrichQuery: true }),
    ).toBe('No entiendo los joins\nÁrea: bases-de-datos. Temas: joins, sql');
    expect(
      queryText('No entiendo los joins', classification, {
        enrichQuery: false,
      }),
    ).toBe('No entiendo los joins');
    expect(queryText('Hola', null, { enrichQuery: true })).toBe('Hola');
  });

  it('la búsqueda híbrida mezcla embedding y palabras', () => {
    expect(hybridSimilarity(0.6, 0.2, 0.5)).toBeCloseTo(0.4);
    expect(hybridSimilarity(0.6, 0.2, 1)).toBeCloseTo(0.6);
  });

  it('la coincidencia de palabras cuenta cada palabra una vez', () => {
    expect(
      lexicalSimilarity('joins joins sql', 'Sé SQL y joins entre tablas'),
    ).toBe(1);
    expect(lexicalSimilarity('integrales', 'Sé SQL')).toBe(0);
  });

  it('el umbral descarta lo que no se parece lo suficiente', () => {
    const c = (id: string, similarity: number) => ({
      id,
      name: id,
      bio: null,
      tags: [],
      similarity,
      avgRating: null,
    });
    const top = rank([c('a', 0.5), c('b', 0.2)], 'nadie', 3, {
      similarityWeight: 0.8,
      minSimilarity: 0.3,
    });
    expect(top.map((x) => x.id)).toEqual(['a']);
  });
});
