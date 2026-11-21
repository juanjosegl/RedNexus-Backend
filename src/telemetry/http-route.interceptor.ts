import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { context, trace } from '@opentelemetry/api';
import { getRPCMetadata, RPCType } from '@opentelemetry/core';

// PL-07: la instrumentación de http solo ve "POST"; aquí se le dice la ruta de Nest
// (/api/help-requests/:id) para que trazas y métricas se agrupen por endpoint sin
// incluir ids. Sin OpenTelemetry activo no hace nada.
@Injectable()
export class HttpRouteInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    if (ctx.getType() === 'http') {
      const req = ctx
        .switchToHttp()
        .getRequest<{ method: string; route?: { path?: string } }>();
      const route = req.route?.path;
      if (route) {
        const rpc = getRPCMetadata(context.active());
        if (rpc?.type === RPCType.HTTP) rpc.route = route;
        trace.getActiveSpan()?.updateName(`${req.method} ${route}`);
      }
    }
    return next.handle();
  }
}
