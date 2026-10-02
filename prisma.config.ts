import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Sin .env (CI, build de Docker) basta para `prisma generate`; migrar si exige una URL real.
    url:
      process.env.DATABASE_URL ??
      'postgresql://rednexus:rednexus@localhost:5432/rednexus',
  },
});
