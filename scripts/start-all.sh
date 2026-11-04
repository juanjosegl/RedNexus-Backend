#!/bin/sh
# Arranque en un solo contenedor para planes gratis sin workers aparte (Render Free):
# migraciones, datos sintéticos opcionales, worker de IA en segundo plano y API en primer plano.
# En Docker Compose y Kubernetes no se usa: ahí cada proceso tiene su propio contenedor.
set -e

prisma migrate deploy
if [ "${SEED_DEMO:-false}" = "true" ]; then
  prisma db seed
fi

node dist/worker &

# exec: la API recibe directamente SIGTERM al reiniciar o redesplegar
exec node dist/main
