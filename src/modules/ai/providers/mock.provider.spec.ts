import { EMBEDDING_DIMENSIONS } from '../ai-provider.js';
import { MockAiProvider } from './mock.provider.js';

const cosine = (a: number[], b: number[]) =>
  a.reduce((s, x, i) => s + x * b[i], 0);

describe('MockAiProvider', () => {
  const ai = new MockAiProvider();

  it('genera vectores normalizados de 768 dimensiones', async () => {
    const v = await ai.embed('consultas SQL con joins');
    expect(v).toHaveLength(EMBEDDING_DIMENSIONS);
    expect(Math.hypot(...v)).toBeCloseTo(1);
  });

  it('es determinístico', async () => {
    expect(await ai.embed('derivadas')).toEqual(await ai.embed('derivadas'));
  });

  it('acerca textos con palabras en común', async () => {
    const pregunta = await ai.embed('No entiendo los joins en SQL');
    const sql = await ai.embed('Sé SQL y joins entre tablas');
    const calculo = await ai.embed('Cálculo diferencial e integrales');
    expect(cosine(pregunta, sql)).toBeGreaterThan(cosine(pregunta, calculo));
  });

  it('no devuelve el vector cero para un texto vacío', async () => {
    expect(Math.hypot(...(await ai.embed('')))).toBeCloseTo(1);
  });

  it('clasifica por palabras clave y muestra las palabras originales', async () => {
    const c = await ai.classify(
      'No entiendo cómo hacer consultas en SQL con relaciones',
    );
    expect(c.area).toBe('bases-de-datos');
    expect(c.topics).toContain('relaciones');
    expect(c.level).toBe('basico');
  });

  it('explica con las palabras del perfil que coinciden', async () => {
    const text = await ai.explain('ayuda con derivadas', {
      name: 'Sofía',
      bio: 'Sé derivadas e integrales',
      tags: [],
    });
    expect(text).toBe('Sofía encaja porque su perfil menciona: derivadas.');
  });
});
