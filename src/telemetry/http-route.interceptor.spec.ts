import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { context, trace } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import {
  BatchSpanProcessor,
  InMemorySpanExporter,
  TracerProvider,
} from '@opentelemetry/sdk-trace';
import { of } from 'rxjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { HttpRouteInterceptor } from './http-route.interceptor.js';

describe('HttpRouteInterceptor (PL-07)', () => {
  const exporter = new InMemorySpanExporter();
  const provider = new TracerProvider({
    spanProcessors: [new BatchSpanProcessor({ exporter })],
  });
  const interceptor = new HttpRouteInterceptor();

  // Contexto HTTP falso con el método y la ruta de Nest que lee el interceptor
  const httpContext = (method: string, path: string) =>
    ({
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({ method, route: { path } }),
      }),
    }) as unknown as ExecutionContext;

  const next: CallHandler = { handle: () => of('ok') };

  beforeAll(() => {
    // Sin gestor de contexto no existe "span activo"
    context.setGlobalContextManager(
      new AsyncLocalStorageContextManager().enable(),
    );
    trace.setGlobalTracerProvider(provider);
  });
  afterAll(() => {
    trace.disable();
    context.disable();
  });

  it('renombra el span activo con la ruta de nest', async () => {
    const tracer = trace.getTracer('prueba');
    tracer.startActiveSpan('GET', (span) => {
      interceptor.intercept(httpContext('GET', '/api/help-requests/:id'), next);
      span.end();
    });
    await provider.forceFlush();

    const nombres = exporter.getFinishedSpans().map((s) => s.name);
    expect(nombres).toContain('GET /api/help-requests/:id');
  });
});
