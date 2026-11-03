// Datos sinteticos para desarrollo y demo. Nunca cargar datos reales de estudiantes (Ley 1581).
// Se puede correr varias veces (upsert)
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { profiles } from './data/profiles.js';

const DEMO_PASSWORD = 'demo12345';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  for (const p of profiles) {
    const data = { name: p.name, bio: p.bio, tags: p.tags, passwordHash };
    await prisma.user.upsert({
      where: { email: p.email },
      update: data,
      create: { email: p.email, ...data },
    });
  }
  console.log(
    `Seed: ${profiles.length} perfiles sintéticos (contraseña ${DEMO_PASSWORD})`,
  );
}

main().finally(() => prisma.$disconnect());
