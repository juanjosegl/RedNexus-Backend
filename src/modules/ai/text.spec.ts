import { overlap, tokenize } from './text.js';
import { describe, expect, it } from 'vitest';
describe('tokenize', () => {
  it('ignora mayúsculas, tildes y palabras vacías', () => {
    expect(tokenize('LA Física de los ÁRBOLES')).toEqual([
      'fisica',
      'arbole',
    ]);
  });

  it('limita cada palabra a 6 caracteres', () => {
    expect(tokenize('programacion informatica')).toEqual([
      'progra',
      'inform',
    ]);
  });
});

describe('overlap', () => {
  it('devuelve únicamente las palabras en común', () => {
    expect(overlap(['java', 'python', 'sql'], ['python', 'sql', 'html'])).toEqual([
      'python',
      'sql',
    ]);
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
