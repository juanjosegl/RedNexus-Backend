import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Get, Header, Logger } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
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

// Tiempo máximo de espera por dependencia. BullMQ reintenta sin fin si Redis
// está caído, así que sin este límite la probe se quedaría colgada.
const DB_TIMEOUT_MS = 2000;
const REDIS_TIMEOUT_MS = 2000;

// Mensajes públicos: nunca se expone el error interno (host, puerto, etc.)
const REDIS_TIMEOUT_MESSAGE = 'Redis no contestó a tiempo';
const REDIS_DOWN_MESSAGE = 'Redis no disponible';

// BE-21: readiness. A diferencia de /api/health (liveness: "el proceso está vivo"),
// este endpoint revisa Postgres y Redis. Lo usa la readinessProbe de Kubernetes.
@Public()
@ApiTags('health')
@Controller('health')
export class ReadinessController {
  private readonly logger = new Logger(ReadinessController.name);

  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
    private readonly indicator: HealthIndicatorService,
    private readonly prisma: PrismaService,
    @InjectQueue(AI_QUEUE) private readonly queue: Queue,
  ) {}

  @Get('ready')
  @HealthCheck()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'Readiness: verifica Postgres y Redis',
    description:
      'Responde 200 si ambas dependencias contestan y 503 si alguna falla. ' +
      'Lo usa la readinessProbe de Kubernetes. Para liveness usar GET /api/health.',
  })
  @ApiOkResponse({
    description: 'Postgres y Redis responden',
    schema: {
      example: {
        status: 'ok',
        info: { database: { status: 'up' }, redis: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' }, redis: { status: 'up' } },
      },
    },
  })
  @ApiServiceUnavailableResponse({
    description:
      'Postgres o Redis no responden (límite de 2 s por dependencia)',
    schema: {
      example: {
        status: 'error',
        info: { database: { status: 'up' } },
        error: {
          redis: { status: 'down', message: REDIS_TIMEOUT_MESSAGE },
        },
        details: {
          database: { status: 'up' },
          redis: { status: 'down', message: REDIS_TIMEOUT_MESSAGE },
        },
      },
    },
  })
  ready() {
    // Terminus ejecuta los indicadores en paralelo
    return this.health.check([
      // Postgres: un SELECT 1 a través de Prisma
      () =>
        this.prismaIndicator.pingCheck('database', this.prisma, {
          timeout: DB_TIMEOUT_MS,
        }),
      () => this.checkRedis(),
    ]);
  }

  // Redis: consulta barata con la conexión que ya usa la cola de BullMQ
  private async checkRedis() {
    const redis = this.indicator.check('redis');
    let timer: NodeJS.Timeout | undefined;
    const limite = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(REDIS_TIMEOUT_MESSAGE)),
        REDIS_TIMEOUT_MS,
      );
    });

    try {
      await Promise.race([this.queue.isPaused(), limite]);
      return redis.up();
    } catch (e) {
      const error = e as Error;
      // El detalle real queda en el log; al cliente solo un mensaje genérico
      this.logger.warn(`Readiness: Redis falló (${error.message})`);
      return redis.down(
        error.message === REDIS_TIMEOUT_MESSAGE
          ? REDIS_TIMEOUT_MESSAGE
          : REDIS_DOWN_MESSAGE,
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
