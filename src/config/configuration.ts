import { matchingConfigFromEnv } from '../modules/matching/matching-config.js';

// Variables de entorno agrupadas por tema. Se leen desde .env (ver .env.example).
export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: process.env.DATABASE_URL,
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  ai: {
    // mock | ollama
    provider: process.env.AI_PROVIDER ?? 'mock',
  },
  ollama: {
    url: process.env.OLLAMA_URL ?? 'http://localhost:11434',
    // IA-07: qwen2.5:3b y paraphrase-multilingual (768 dimensiones, mejor en español que nomic)
    llmModel: process.env.OLLAMA_LLM_MODEL ?? 'qwen2.5:3b',
    embedModel: process.env.OLLAMA_EMBED_MODEL ?? 'paraphrase-multilingual',
    timeoutMs: parseInt(process.env.OLLAMA_TIMEOUT_MS ?? '20000', 10),
  },
  // Notas de voz (BE-04, IA-05). mock | whisper
  transcription: {
    provider: process.env.TRANSCRIBE_PROVIDER ?? 'mock',
    whisperUrl: process.env.WHISPER_URL ?? 'http://localhost:8178',
    language: process.env.WHISPER_LANGUAGE ?? 'es',
    timeoutMs: parseInt(process.env.WHISPER_TIMEOUT_MS ?? '120000', 10),
  },
  // Asistente de soporte (RAG en Open WebUI). Las variables se documentan en BE-09.
  support: {
    // mock | openwebui
    provider: process.env.SUPPORT_PROVIDER ?? 'mock',
    openWebUiUrl: process.env.OPENWEBUI_URL ?? 'http://localhost:3001',
    apiKey: process.env.OPENWEBUI_API_KEY ?? '',
    model: process.env.SUPPORT_MODEL ?? 'asistente-rednexus',
    timeoutMs: parseInt(process.env.SUPPORT_TIMEOUT_MS ?? '60000', 10),
  },
  // Configuración del emparejamiento elegida con MLflow (IA-07)
  matching: matchingConfigFromEnv(),
  jwtSecret: process.env.JWT_SECRET,
});
