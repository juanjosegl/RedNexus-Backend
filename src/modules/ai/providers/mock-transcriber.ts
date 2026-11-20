import type { Transcriber } from '../transcription.js';

// Sin whisper.cpp: devuelve siempre la misma duda, para desarrollo, CI y la demo sin nodo de IA
export const MOCK_TRANSCRIPT =
  'No entiendo cómo hacer joins en SQL entre tablas con relaciones muchos a muchos';

export class MockTranscriber implements Transcriber {
  readonly name = 'mock';

  async transcribe(audio: Buffer): Promise<string> {
    if (audio.length === 0) return '';
    return MOCK_TRANSCRIPT;
  }
}
