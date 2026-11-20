import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import configuration from '../src/config/configuration.js';
import { SupportModule } from '../src/modules/support/support.module.js';

describe('POST /support/chat (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Siempre el mock, aunque el .env local apunte a Open WebUI
    process.env.SUPPORT_PROVIDER = 'mock';
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [configuration],
        }),
        SupportModule,
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responde 200 con el mock', async () => {
    const res = await request(app.getHttpServer())
      .post('/support/chat')
      .send({ message: '¿Cómo me registro?' })
      .expect(200);

    expect(res.body.provider).toBe('mock');
    expect(typeof res.body.answer).toBe('string');
    expect(Array.isArray(res.body.sources)).toBe(true);
    expect(typeof res.body.latencyMs).toBe('number');
  });

  it('responde 400 si el mensaje está vacío', () => {
    return request(app.getHttpServer())
      .post('/support/chat')
      .send({ message: '' })
      .expect(400);
  });

  it('responde 400 si un turno del historial tiene un rol inválido', () => {
    return request(app.getHttpServer())
      .post('/support/chat')
      .send({ message: 'hola', history: [{ role: 'sistema', content: 'x' }] })
      .expect(400);
  });

  it('responde 400 si el historial tiene más de 10 turnos', () => {
    const history = Array.from({ length: 11 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `turno ${i + 1}`,
    }));
    return request(app.getHttpServer())
      .post('/support/chat')
      .send({ message: 'hola', history })
      .expect(400);
  });
});
