# RedNexus Backend

API y worker de IA de **RedNexus**, la red de apoyo académico que conecta cada solicitud de ayuda con los 3 compañeros que más saben del tema, usando búsqueda semántica con IA local.

Stack: NestJS 12 (TypeScript), PostgreSQL + pgvector, Prisma, Redis + BullMQ, Ollama y whisper.cpp.

## Requisitos

- Node.js 24 (con [nvm](https://github.com/nvm-sh/nvm) o [fnm](https://github.com/Schniz/fnm); ambos leen `.nvmrc`)
- Docker con Compose (en Mac, [Colima](https://github.com/abiosoft/colima); en Windows, Docker Desktop con WSL2)
- Opcional para la IA: [Ollama](https://ollama.com) con `llama3.2:3b` y `nomic-embed-text`

**¿Primera vez?** Sigue la [guía del equipo](https://github.com/juanjosegl/RedNexus-Platform/blob/developer/docs/guia-del-equipo.md); las tareas están en [tareas.md](https://github.com/juanjosegl/RedNexus-Platform/blob/developer/docs/tareas.md).

## Arranque

```bash
git checkout developer
cp .env.example .env
docker compose up -d          # Postgres + pgvector y Redis
npm install                   # también genera el cliente de Prisma
npm run db:migrate            # crea las tablas
npm run db:seed               # datos sintéticos de prueba
npm run start:dev             # API en http://localhost:3000/api/health
```

En otra terminal, el worker de IA: `npm run start:worker:dev`.

- **Prefijo:** todas las rutas de la API van bajo `/api`.
- **Swagger:** el contrato de la API está en http://localhost:3000/api/docs. Documenta cada controlador nuevo con `@ApiTags` y `@ApiOperation`, y cada DTO con `@ApiProperty` (ejemplo: `src/modules/health/health.controller.ts`). Así el equipo de frontend sabe qué enviar y qué recibir sin preguntar.
- **Docker y Kubernetes:** la imagen Docker (`Dockerfile`) se usa para la API, el worker y las migraciones. Su despliegue está en [RedNexus-Platform](https://github.com/juanjosegl/RedNexus-Platform).

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
    └── health/        # /api/health
prisma/                # schema, migraciones y datos sintéticos
```

## Ramas

| Rama | Uso |
| --- | --- |
| `main` | Versión estable. Solo entra por PR desde `test`. |
| `test` | QA. Entra por PR desde `developer`. |
| `developer` | Integración diaria. Entra por PR desde `feature/*` o `fix/*`. |

Flujo: `git switch developer && git pull`, luego `git switch -c feature/BE-01-auth` (tipo/ID-de-la-tarea-descripcion), commits como `feat(auth): registro con contraseña cifrada` y PR hacia `developer`. Reglas completas en [CONTRIBUTING](https://github.com/juanjosegl/RedNexus-Platform/blob/developer/CONTRIBUTING.md).

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
