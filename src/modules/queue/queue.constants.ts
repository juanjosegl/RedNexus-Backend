import type { JobsOptions } from 'bullmq';

// Nombres de las colas BullMQ. La API encola trabajos y el worker (src/worker.ts) los procesa.
export const AI_QUEUE = 'ai';

export const AiJob = {
  // Transcribir una nota de voz con whisper.cpp
  Transcribe: 'transcribe',
  // Clasificar la solicitud, generar su embedding y buscar el top 3
  Match: 'match',
  // Calcular el embedding de un perfil
  EmbedProfile: 'embed-profile',
} as const;

export interface MatchJobData {
  requestId: string;
}

export interface EmbedProfileJobData {
  userId: string;
}

// 3 reintentos con backoff. Sin jobId fijo: BullMQ ignora ids de trabajos ya guardados
export const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: 500,
  removeOnFail: 1000,
};
