import {
  AiProvider,
  Classification,
  EMBEDDING_DIMENSIONS,
  HelperProfile,
} from '../ai-provider.js';
import { hash, matchingWords, overlap, tokenize } from '../text.js';

const HASH_SEEDS = [0x811c9dc5, 0x01000193];

// palabras clave por area (solo para el mock)
const AREAS: Record<string, string[]> = {
  'bases-de-datos': [
    'sql',
    'join',
    'joins',
    'consul',
    'tabla',
    'tablas',
    'postgr',
    'mysql',
    'normal',
    'base',
    'datos',
    'entida',
    'relaci',
  ],
  programacion: [
    'python',
    'java',
    'javasc',
    'typesc',
    'funcio',
    'bucle',
    'recurs',
    'clase',
    'objeto',
    'codigo',
    'progra',
    'algori',
    'arregl',
    'vue',
    'nestjs',
    'git',
  ],
  matematicas: [
    'calcul',
    'deriva',
    'integr',
    'algebr',
    'matriz',
    'matric',
    'limite',
    'ecuaci',
    'probab',
    'estadi',
    'vector',
    'discre',
  ],
  redes: [
    'red',
    'redes',
    'tcp',
    'ip',
    'router',
    'subred',
    'dns',
    'http',
    'protoc',
    'osi',
  ],
  'cloud-devops': [
    'docker',
    'kubern',
    'k8s',
    'conten',
    'cloud',
    'nube',
    'ci',
    'cd',
    'pipeli',
    'deploy',
    'despli',
    'linux',
  ],
  ingles: ['ingles', 'englis', 'gramat', 'gramma', 'verbo', 'writin', 'speaki'],
  fisica: [
    'fisica',
    'fuerza',
    'newton',
    'energi',
    'cinema',
    'electr',
    'circui',
  ],
};

// Mock sin red para desarrollo y CI
export class MockAiProvider implements AiProvider {
  readonly name = 'mock';

  // feature hashing: cada palabra suma en 2 posiciones del vector
  async embed(text: string): Promise<number[]> {
    const vector: number[] = Array.from(
      { length: EMBEDDING_DIMENSIONS },
      () => 0,
    );
    for (const token of tokenize(text)) {
      for (const seed of HASH_SEEDS) {
        const h = hash(token, seed);
        vector[h % EMBEDDING_DIMENSIONS] += h & 0x80000000 ? -1 : 1;
      }
    }
    const norm = Math.hypot(...vector);
    if (norm === 0) {
      vector[0] = 1; // evitar el vector cero
      return vector;
    }
    return vector.map((v) => v / norm);
  }

  async classify(text: string): Promise<Classification> {
    const tokens = tokenize(text);
    let area = 'general';
    let best: string[] = [];
    for (const [name, keywords] of Object.entries(AREAS)) {
      const hits = overlap(tokens, keywords);
      if (hits.length > best.length) {
        area = name;
        best = hits;
      }
    }
    const lower = text.toLowerCase();
    const level = /avanzad|optimiz|complej/.test(lower)
      ? 'avanzado'
      : /no entiendo|basic|básic|empez|desde cero/.test(lower)
        ? 'basico'
        : 'intermedio';
    return { area, topics: matchingWords(best, text).slice(0, 5), level };
  }

  async explain(request: string, helper: HelperProfile): Promise<string> {
    const common = matchingWords(
      tokenize(request),
      `${helper.bio ?? ''} ${helper.tags.join(' ')}`,
    );
    if (common.length === 0) {
      return `${helper.name} no comparte temas explícitos con tu solicitud, pero es el perfil más cercano disponible.`;
    }
    return `${helper.name} encaja porque su perfil menciona: ${common.slice(0, 4).join(', ')}.`;
  }
}
