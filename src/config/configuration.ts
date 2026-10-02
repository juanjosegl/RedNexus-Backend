// Variables de entorno agrupadas por tema. Se leen desde .env (ver .env.example).
export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: process.env.DATABASE_URL,
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  ollama: {
    url: process.env.OLLAMA_URL ?? 'http://localhost:11434',
    llmModel: process.env.OLLAMA_LLM_MODEL ?? 'llama3.2:3b',
    embedModel: process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text',
  },
  jwtSecret: process.env.JWT_SECRET,
});
