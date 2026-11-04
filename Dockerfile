# Imagen multi-etapa. En CI se construye para linux/amd64 y linux/arm64 con docker buildx.
# Una sola imagen para los tres usos:
#   API:          node dist/main  (por defecto)
#   Worker:       node dist/worker
#   Migraciones:  prisma migrate deploy   (+ prisma db seed para datos de prueba)

FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PATH=/app/node_modules/.bin:$PATH
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json /app/prisma.config.ts ./
COPY --from=build /app/prisma ./prisma
# El seed (prisma/seed.ts) importa el cliente generado en TypeScript
COPY --from=build /app/src/generated ./src/generated
USER node
EXPOSE 3000
CMD ["node", "dist/main"]
