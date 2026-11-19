import {
  OpenWebUiSupportProvider,
  parseCompletion,
} from './openwebui.provider.js';

describe('parseCompletion', () => {
  it('toma la respuesta y los documentos usados sin repetir', () => {
    expect(
      parseCompletion({
        choices: [{ message: { content: '  Puedes calificar de 1 a 5.  ' } }],
        sources: [
          {
            source: { name: 'Base RedNexus' },
            metadata: [
              { name: 'calificaciones.md' },
              { source: 'calificaciones.md' },
            ],
          },
        ],
      }),
    ).toEqual({
      answer: 'Puedes calificar de 1 a 5.',
      sources: ['calificaciones.md', 'Base RedNexus'],
    });
  });

  it('acepta respuestas sin fuentes', () => {
    expect(
      parseCompletion({ choices: [{ message: { content: 'Hola' } }] }),
    ).toEqual({ answer: 'Hola', sources: [] });
  });

  it('falla si no hay respuesta', () => {
    expect(() => parseCompletion({ choices: [] })).toThrow();
    expect(() => parseCompletion(null)).toThrow();
  });
});

describe('OpenWebUiSupportProvider', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('llama a /api/chat/completions con el modelo y la API key', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ choices: [{ message: { content: 'Respuesta' } }] }),
        ),
      );
    vi.stubGlobal('fetch', fetchMock);
    const provider = new OpenWebUiSupportProvider({
      url: 'http://owui:8080',
      apiKey: 'sk-prueba',
      model: 'asistente-rednexus',
      timeoutMs: 1000,
    });

    const reply = await provider.ask([{ role: 'user', content: 'Hola' }]);

    expect(reply.answer).toBe('Respuesta');
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://owui:8080/api/chat/completions');
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer sk-prueba',
    );
    expect(JSON.parse(init.body as string)).toMatchObject({
      model: 'asistente-rednexus',
      stream: false,
      messages: [{ role: 'user', content: 'Hola' }],
    });
  });

  it('lanza error si Open WebUI no responde 200', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('no autorizado', { status: 401 })),
    );
    const provider = new OpenWebUiSupportProvider({
      url: 'http://owui:8080',
      apiKey: 'mala',
      model: 'asistente-rednexus',
      timeoutMs: 1000,
    });

    await expect(
      provider.ask([{ role: 'user', content: 'Hola' }]),
    ).rejects.toThrow('401');
  });
});
