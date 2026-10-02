import { Controller, Get } from '@nestjs/common';

// Usado por Kubernetes (liveness/readiness) y para comprobar que la API arranco.
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}
