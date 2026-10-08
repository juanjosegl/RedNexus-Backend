import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

// Usado por Kubernetes (liveness/readiness) y para comprobar que la API arranco.
@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Comprueba que la API está arriba' })
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  check() {
    return { status: 'ok' };
  }
}
