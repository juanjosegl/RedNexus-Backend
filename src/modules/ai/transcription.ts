// Transcripción de notas de voz: whisper.cpp (real) o mock (pruebas), según TRANSCRIBE_PROVIDER

export const TRANSCRIBER = Symbol('TRANSCRIBER');

// Texto temporal de una solicitud por voz mientras el worker la transcribe.
// El emparejamiento ignora las solicitudes que todavía tienen este texto.
export const VOICE_PLACEHOLDER = '(nota de voz en transcripción)';

// Formatos que graba el navegador (MediaRecorder) y los más comunes en celulares
export const AUDIO_MIME_TYPES = [
  'audio/webm',
  'audio/ogg',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/mp4',
  'audio/x-m4a',
] as const;

export const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

export interface Transcriber {
  readonly name: string;
  transcribe(audio: Buffer, mimeType: string): Promise<string>;
}

// "audio/webm;codecs=opus" -> "audio/webm"
export function baseMimeType(mimeType: string): string {
  return mimeType.split(';')[0].trim().toLowerCase();
}

export function isSupportedAudio(mimeType: string): boolean {
  return (AUDIO_MIME_TYPES as readonly string[]).includes(
    baseMimeType(mimeType),
  );
}

export function audioExtension(mimeType: string): string {
  const base = baseMimeType(mimeType);
  if (base.includes('webm')) return 'webm';
  if (base.includes('ogg')) return 'ogg';
  if (base.includes('wav') || base.includes('wave')) return 'wav';
  if (base.includes('mp4') || base.includes('m4a')) return 'm4a';
  return 'mp3';
}

// whisper.cpp marca silencios y ruido con [BLANK_AUDIO], (música), etc.
export function cleanTranscript(text: string): string {
  return text
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\((?:música|music|ruido|noise|silencio)[^)]*\)/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
