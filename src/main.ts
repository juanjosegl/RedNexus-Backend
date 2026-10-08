import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Todas las rutas bajo /api: el frontend llama a /api en desarrollo (proxy de Vite),
  // en Docker y en Kubernetes (proxy de Nginx), sin depender de la URL del backend.
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Cierre ordenado al recibir SIGTERM (Kubernetes, docker stop): sin esto Node, como
  // proceso principal del contenedor, ignora la señal y lo matan tras 30 s
  app.enableShutdownHooks();

  // Contrato de la API para el equipo de frontend: /api/docs (JSON en /api/docs-json).
  // Cada controlador documenta sus rutas con @ApiTags y sus DTO con @ApiProperty.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('RedNexus API')
    .setDescription('Red de apoyo académico con emparejamiento por IA local')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, () =>
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.listen(app.get(ConfigService).get<number>('port') ?? 3000);
}
await bootstrap();
