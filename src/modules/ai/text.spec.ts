import { describe, expect, it } from 'vitest';
import { lexicalSimilarity, overlap, toPgVector, tokenize } from './text.js';

describe('tokenize', () => {
  it('ignora mayúsculas, tildes y palabras vacías', () => {
    expect(tokenize('LA Física de los ÁRBOLES')).toEqual(['fisica', 'arbole']);
  });

  it('limita cada palabra a 6 caracteres', () => {
    expect(tokenize('programacion informatica')).toEqual(['progra', 'inform']);
  });
});

describe('overlap', () => {
  it('devuelve únicamente las palabras en común', () => {
    expect(
      overlap(['java', 'python', 'sql'], ['python', 'sql', 'html']),
    ).toEqual(['python', 'sql']);
  });

  it('no repite palabras coincidentes', () => {
    expect(overlap(['java', 'java', 'sql'], ['java', 'sql'])).toEqual([
      'java',
      'sql',
    ]);
  });

  it('devuelve un arreglo vacío cuando no hay coincidencias', () => {
    expect(overlap(['java', 'python'], ['html', 'css'])).toEqual([]);
  });
});

describe('lexicalSimilarity', () => {
  it('da mayor puntuación a perfiles que comparten palabras con la duda', () => {
    const query = 'Necesito ayuda con programación';

    const matchingProfile = lexicalSimilarity(
      query,
      'Tengo experiencia en programación',
    );

    const unrelatedProfile = lexicalSimilarity(
      query,
      'Me gusta la música y el deporte',
    );

    expect(matchingProfile).toBeGreaterThan(unrelatedProfile);
  });

  it('devuelve cero cuando la consulta no tiene palabras útiles', () => {
    expect(lexicalSimilarity('de la y con', 'programación')).toBe(0);
  });
});

describe('toPgVector', () => {
  it('convierte un arreglo numérico al formato de PostgreSQL', () => {
    expect(toPgVector([1, 2])).toBe('[1,2]');
  });
});
