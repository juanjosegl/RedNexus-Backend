import { parseClassification } from './ollama.provider.js';

describe('parseClassification', () => {
  it('acepta el JSON esperado y normaliza los temas', () => {
    expect(
      parseClassification(
        '{"area":"Bases-de-Datos","topics":[" SQL ","joins"],"level":"basico"}',
      ),
    ).toEqual({
      area: 'bases-de-datos',
      topics: ['sql', 'joins'],
      level: 'basico',
    });
  });

  it('usa intermedio si el nivel no es válido', () => {
    expect(
      parseClassification('{"area":"redes","topics":[],"level":"experto"}')
        ?.level,
    ).toBe('intermedio');
  });

  it('rechaza lo que no es JSON o le faltan campos', () => {
    expect(parseClassification('Claro, aquí está la clasificación')).toBeNull();
    expect(parseClassification('{"area":"redes"}')).toBeNull();
  });
});
