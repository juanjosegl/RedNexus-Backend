// PL-07: primero OpenTelemetry (solo se activa con OTEL_EXPORTER_OTLP_ENDPOINT)
import './telemetry/telemetry.js';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module.js';

// Proceso separado de la API: consume trabajos de IA desde Redis (BullMQ).
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();
}
await bootstrap();
