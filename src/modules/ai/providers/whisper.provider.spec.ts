import { WhisperTranscriber } from './whisper.provider.js';

describe('WhisperTranscriber', () => {
  const transcriber = new WhisperTranscriber({
    url: 'http://whisper:8178',
    language: 'es',
    timeoutMs: 1000,
  });

  afterEach(() => vi.unstubAllGlobals());

  it('envía el audio a /inference y limpia el texto', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ text: ' [BLANK_AUDIO] Necesito ayuda con SQL ' }),
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    expect(
      await transcriber.transcribe(Buffer.from('a'), 'audio/webm;codecs=opus'),
    ).toBe('Necesito ayuda con SQL');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://whisper:8178/inference');
    const form = init.body as FormData;
    expect(form.get('language')).toBe('es');
    expect((form.get('file') as File).name).toBe('nota.webm');
  });

  it('falla si el servidor responde con error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('sin modelo', { status: 500 })),
    );
    await expect(
      transcriber.transcribe(Buffer.from('a'), 'audio/wav'),
    ).rejects.toThrow('whisper.cpp respondió 500');
  });
});
