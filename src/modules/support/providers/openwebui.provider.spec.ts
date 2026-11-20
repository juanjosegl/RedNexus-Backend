import {
  documentNames,
  OpenWebUiSupportProvider,
  parseStream,
} from './openwebui.provider.js';

function sse(...events: unknown[]) {
  return (
    events.map((e) => `data: ${JSON.stringify(e)}`).join('\n\n') +
    '\n\ndata: [DONE]\n\n'
  );
}

const sourcesEvent = {
  sources: [
    {
      source: { name: 'Base RedNexus' },
      metadata: [
        { name: 'calificaciones.md' },
        { source: 'calificaciones.md' },
      ],
    },
  ],
};

describe('parseStream', () => {
  it('une los fragmentos y toma los documentos usados', () => {
    expect(
      parseStream(
        sse(
          sourcesEvent,
          { choices: [{ delta: { content: '  Puedes calificar ' } }] },
          { choices: [{ delta: { content: 'de 1 a 5.  ' } }] },
        ),
      ),
    ).toEqual({
      answer: 'Puedes calificar de 1 a 5.',
      sources: ['calificaciones.md'],
    });
  });

  it('acepta respuestas sin fuentes e ignora líneas que no son datos', () => {
    expect(
      parseStream(
        ': keep-alive\n\n' + sse({ choices: [{ delta: { content: 'Hola' } }] }),
      ),
    ).toEqual({ answer: 'Hola', sources: [] });
  });

  it('falla si no hay respuesta o si Open WebUI manda un error', () => {
    expect(() => parseStream(sse(sourcesEvent))).toThrow();
    expect(() => parseStream(sse({ error: { detail: 'sin modelo' } }))).toThrow(
      'sin modelo',
    );
  });
});

describe('documentNames', () => {
  it('usa el nombre de la fuente si no hay metadatos', () => {
    expect(documentNames([{ source: { name: 'pqrs.md' } }])).toEqual([
      'pqrs.md',
    ]);
  });
});

describe('OpenWebUiSupportProvider', () => {
  afterEach(() => vi.unstubAllGlobals());

  const options = {
    url: 'http://owui:8080',
    apiKey: 'sk-prueba',
    model: 'asistente-rednexus',
    timeoutMs: 1000,
  };

  it('llama a /api/chat/completions con stream, el modelo y la API key', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(sse({ choices: [{ delta: { content: 'Respuesta' } }] })),
      );
    vi.stubGlobal('fetch', fetchMock);

    const reply = await new OpenWebUiSupportProvider(options).ask([
      { role: 'user', content: 'Hola' },
    ]);

    expect(reply.answer).toBe('Respuesta');
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://owui:8080/api/chat/completions');
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer sk-prueba',
    );
    expect(JSON.parse(init.body as string)).toMatchObject({
      model: 'asistente-rednexus',
      stream: true,
      messages: [{ role: 'user', content: 'Hola' }],
    });
  });

  it('si responde "Model not found" refresca los modelos y reintenta una vez', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('{"detail":"Model not found"}', { status: 400 }),
      )
      .mockResolvedValueOnce(new Response('{"data":[]}'))
      .mockResolvedValueOnce(
        new Response(sse({ choices: [{ delta: { content: 'Ya' } }] })),
      );
    vi.stubGlobal('fetch', fetchMock);

    const reply = await new OpenWebUiSupportProvider(options).ask([
      { role: 'user', content: 'Hola' },
    ]);

    expect(reply.answer).toBe('Ya');
    expect(fetchMock.mock.calls[1][0]).toBe('http://owui:8080/api/models');
  });

  it('lanza error si Open WebUI no responde 200', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('no autorizado', { status: 401 })),
    );

    await expect(
      new OpenWebUiSupportProvider({ ...options, apiKey: 'mala' }).ask([
        { role: 'user', content: 'Hola' },
      ]),
    ).rejects.toThrow('401');
  });
});
