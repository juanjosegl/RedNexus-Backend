import {
  audioExtension,
  baseMimeType,
  cleanTranscript,
  type Transcriber,
} from '../transcription.js';

export interface WhisperOptions {
  // servidor de whisper.cpp: whisper-server -m ggml-base.bin --convert --port 8178
  url: string;
  language: string;
  timeoutMs: number;
}

// Cliente del endpoint /inference de whisper.cpp (https://github.com/ggml-org/whisper.cpp/tree/master/examples/server).
// Con --convert el servidor usa ffmpeg para aceptar webm, ogg o mp3, no solo wav.
export class WhisperTranscriber implements Transcriber {
  readonly name = 'whisper';

  constructor(private readonly options: WhisperOptions) {}

  async transcribe(audio: Buffer, mimeType: string): Promise<string> {
    const form = new FormData();
    form.append(
      'file',
      new Blob([new Uint8Array(audio)], { type: baseMimeType(mimeType) }),
      `nota.${audioExtension(mimeType)}`,
    );
    form.append('language', this.options.language);
    form.append('response_format', 'json');
    form.append('temperature', '0');

    const res = await fetch(`${this.options.url}/inference`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(this.options.timeoutMs),
    });
    if (!res.ok) {
      throw new Error(
        `whisper.cpp respondió ${res.status}: ${(await res.text()).slice(0, 200)}`,
      );
    }
    const data = (await res.json()) as { text?: string; error?: string };
    if (data.error) throw new Error(`whisper.cpp: ${data.error}`);
    return cleanTranscript(data.text ?? '');
  }
}
