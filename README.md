# RedNexus Backend

API y worker de IA de **RedNexus**, la red de apoyo académico que conecta cada solicitud de ayuda con los 3 compañeros que más saben del tema, usando búsqueda semántica con IA local.

Stack: NestJS 12 (TypeScript), PostgreSQL + pgvector, Prisma, Redis + BullMQ, Ollama y whisper.cpp.

## Requisitos

- Node.js 24 (con [fnm](https://github.com/Schniz/fnm): `fnm use` lee `.nvmrc`)
- Docker con Compose (en Mac, [Colima](https://github.com/abiosoft/colima))
- Opcional para la IA: [Ollama](https://ollama.com) con `llama3.2:3b` y `nomic-embed-text`

## Arranque en 5 comandos

```bash
git checkout developer
cp .env.example .env
docker compose up -d          # Postgres + pgvector y Redis
npm install                   # también genera el cliente de Prisma
npm run db:migrate            # crea las tablas
npm run start:dev             # API en http://localhost:3000/health
```

En otra terminal, el worker de IA: `npm run start:worker:dev`.

## Estructura

```text
src/
├── main.ts            # API HTTP
├── worker.ts          # worker de IA (consume la cola BullMQ)
├── config/            # variables de entorno
├── prisma/            # PrismaService
└── modules/
    ├── auth/          # registro, login, JWT
    ├── users/         # perfil, habilidades y etiquetas
    ├── help-requests/ # solicitudes por texto o voz
    ├── matching/      # top 3 por embeddings + respaldo por etiquetas
    ├── ai/            # Ollama y whisper.cpp
    ├── queue/         # colas BullMQ
    ├── ratings/       # calificaciones
    └── health/        # /health
prisma/                # schema, migraciones y datos sintéticos
```

## Ramas

| Rama | Uso |
| --- | --- |
| `main` | Versión estable. Solo entra por PR desde `test`. |
| `test` | QA. Entra por PR desde `developer`. |
| `developer` | Integración diaria. Entra por PR desde `feature/*` o `fix/*`. |

Flujo: `git checkout developer && git pull`, luego `git checkout -b feature/RN-12-descripcion`, commits con [Conventional Commits](https://www.conventionalcommits.org/es/) (`feat: ...`, `fix: ...`) y PR hacia `developer`.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run start:dev` | API con recarga automática |
| `npm run start:worker:dev` | Worker de IA con recarga automática |
| `npm run lint` | Revisión de estilo con oxlint |
| `npm test` / `npm run test:e2e` | Pruebas unitarias / de extremo a extremo (Vitest) |
| `npm run db:migrate` | Aplica y crea migraciones de Prisma |
| `npm run db:seed` | Carga datos sintéticos |

## Datos personales

Solo datos sintéticos en desarrollo y demo (Ley 1581 de 2012). Nunca subas el `.env`.
