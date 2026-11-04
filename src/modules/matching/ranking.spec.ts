import { type Candidate, MIN_SIMILARITY, rank, score } from './ranking.js';

const candidate = (
  id: string,
  similarity: number,
  avgRating: number | null = null,
): Candidate => ({
  id,
  name: id,
  bio: null,
  tags: [],
  similarity,
  avgRating,
});

describe('rank', () => {
  it('nunca propone al autor de la solicitud', () => {
    const top = rank(
      [candidate('autor', 0.99), candidate('otro', 0.5)],
      'autor',
    );
    expect(top.map((c) => c.id)).toEqual(['otro']);
  });

  it('devuelve como máximo 3, del mejor al peor', () => {
    const pool = [0.3, 0.9, 0.5, 0.7, 0.6].map((s, i) => candidate(`u${i}`, s));
    expect(rank(pool, 'nadie').map((c) => c.id)).toEqual(['u1', 'u3', 'u4']);
  });

  it('descarta perfiles sin relación', () => {
    expect(rank([candidate('lejano', MIN_SIMILARITY - 0.01)], 'nadie')).toEqual(
      [],
    );
  });

  it('a igual similitud gana quien tiene mejor calificación', () => {
    const top = rank(
      [candidate('regular', 0.6, 2), candidate('bueno', 0.6, 5)],
      'nadie',
    );
    expect(top[0].id).toBe('bueno');
  });

  it('sin calificaciones cuenta como neutral (3 de 5)', () => {
    expect(score(candidate('nuevo', 0.5))).toBeCloseTo(
      score(candidate('tres', 0.5, 3)),
    );
  });
});
