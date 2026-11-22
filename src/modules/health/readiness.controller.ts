import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import type { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Public } from '../auth/auth.decorators.js';
import { AI_QUEUE } from '../queue/queue.constants.js';

// Tiempo máximo de espera a Redis; BullMQ reintenta sin fin si está caído
const REDIS_TIMEOUT_MS = 2000;
// BE-21: readiness. A diferencia de /api/health (liveness: "el proceso está vivo"),
// este endpoint revisa Postgres y Redis. Lo usa la readinessProbe de Kubernetes.
@Public()
@ApiTags('health')
@Controller('health')
export class ReadinessController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
    private readonly indicator: HealthIndicatorService,
    private readonly prisma: PrismaService,
    @InjectQueue(AI_QUEUE) private readonly queue: Queue,
  ) {}

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      // Postgres: un SELECT 1 a través de Prisma
      () => this.prismaIndicator.pingCheck('database', this.prisma),
      // Redis: un PING con la conexión que ya usa la cola de BullMQ
      async () => {
        const redis = this.indicator.check('redis');
        let timer: NodeJS.Timeout | undefined;
        const limite = new Promise<never>((_, reject) => {
          timer = setTimeout(
            () => reject(new Error('Redis no contesto a tiempo')),
            REDIS_TIMEOUT_MS,
          );
        });
        try {
          await Promise.race([this.queue.isPaused(), limite]);
          return redis.up();
        } catch (e) {
          return redis.down((e as Error).message);
        } finally {
          clearTimeout(timer);
        }
      },
    ]);
  }
}
