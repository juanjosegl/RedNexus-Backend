import { getQueueToken } from '@nestjs/bullmq';
import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaHealthIndicator, TerminusModule } from '@nestjs/terminus';
import { describe, expect, it } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AI_QUEUE } from '../queue/queue.constants.js';
import { ReadinessController } from './readiness.controller.js';

async function crearControlador(isPaused: () => Promise<boolean>) {
  const moduleRef = await Test.createTestingModule({
    imports: [TerminusModule],
    controllers: [ReadinessController],
    providers: [
      { provide: PrismaService, useValue: {} },
      { provide: getQueueToken(AI_QUEUE), useValue: { isPaused } },
    ],
  })
    // Postgres siempre "up": aquí solo se prueba Redis
    .overrideProvider(PrismaHealthIndicator)
    .useValue({
      pingCheck: async (key: string) => ({ [key]: { status: 'up' } }),
    })
    .compile();

  return moduleRef.get(ReadinessController);
}

describe('ReadinessController', () => {
  it('responde ok si Postgres y Redis contestan', async () => {
    const controller = await crearControlador(async () => false);

    const resultado = await controller.ready();

    expect(resultado.status).toBe('ok');
    expect(resultado.details?.redis?.status).toBe('up');
  });

  it('responde 503 si redis falla', async () => {
    const controller = await crearControlador(async () => {
      throw new Error('ECONNREFUSED');
    });

    await expect(controller.ready()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('responde 503 si redis no contesta', async () => {
    // Promesa que nunca se resuelve: simula Redis caído con reintentos infinitos
    const controller = await crearControlador(() => new Promise(() => {}));

    let error: ServiceUnavailableException | undefined;
    try {
      await controller.ready();
    } catch (e) {
      error = e as ServiceUnavailableException;
    }

    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect(error?.getStatus()).toBe(503);
    expect(error?.getResponse()).toMatchObject({
      status: 'error',
      error: { redis: { status: 'down' } },
    });
  }, 5000);
});
