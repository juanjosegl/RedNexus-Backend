// Datos sinteticos para desarrollo y demo. Nunca cargar datos reales de estudiantes (Ley 1581).
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  await prisma.user.upsert({
    where: { email: 'ana.demo@rednexus.dev' },
    update: {},
    create: {
      email: 'ana.demo@rednexus.dev',
      passwordHash: 'pendiente',
      name: 'Ana (demo)',
      bio: 'Se SQL, joins y modelado de bases de datos',
      tags: ['bases-de-datos', 'intermedio'],
    },
  });
}

main().finally(() => prisma.$disconnect());
