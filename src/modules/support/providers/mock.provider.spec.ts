import { MOCK_DEFAULT_ANSWER, MockSupportProvider } from './mock.provider.js';

async function ask(question: string) {
  return new MockSupportProvider().ask([{ role: 'user', content: question }]);
}

describe('MockSupportProvider', () => {
  it.each([
    ['¿Cómo me registro?', 'registro-y-perfil.md', 'Registrarse'],
    ['¿Cómo edito mi perfil?', 'registro-y-perfil.md', 'Editar perfil'],
    [
      '¿Cómo publico una solicitud?',
      'solicitudes-de-ayuda.md',
      'Nueva solicitud',
    ],
    ['¿Cómo eligen a los candidatos?', 'emparejamiento.md', '3 candidatos'],
    [
      '¿Cómo CALIFICO a quien me ayudó?',
      'calificaciones.md',
      '1 a 5 estrellas',
    ],
    ['Quiero poner una queja', 'pqrs.md', 'Radicar una PQRS'],
    ['¿Cómo descargo mis datos?', 'privacidad.md', 'Ley 1581'],
  ])('"%s" responde con %s', async (question, source, fragment) => {
    const reply = await ask(question);

    expect(reply.sources).toEqual([source]);
    expect(reply.answer).toContain(fragment);
  });

  it('ignora tildes y mayúsculas', async () => {
    const reply = await ask('CONTRASEÑA y DESCRIPCIÓN');

    expect(reply.sources).toEqual(['registro-y-perfil.md']);
  });

  it('usa la última pregunta del usuario, no el historial', async () => {
    const reply = await new MockSupportProvider().ask([
      { role: 'user', content: '¿Cómo me registro?' },
      { role: 'assistant', content: 'Pulsa Registrarse.' },
      { role: 'user', content: '¿Y cómo califico?' },
    ]);

    expect(reply.sources).toEqual(['calificaciones.md']);
  });

  it('responde la respuesta por defecto si no reconoce el tema', async () => {
    const reply = await ask('¿Qué hora es?');

    expect(reply).toEqual({ answer: MOCK_DEFAULT_ANSWER, sources: [] });
  });
});
