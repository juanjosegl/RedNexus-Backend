// Nombres de las colas BullMQ. La API encola trabajos y el worker (src/worker.ts) los procesa.
export const AI_QUEUE = 'ai';

export const AiJob = {
  // Transcribir una nota de voz con whisper.cpp
  Transcribe: 'transcribe',
  // Clasificar la solicitud, generar su embedding y buscar el top 3
  Match: 'match',
} as const;
