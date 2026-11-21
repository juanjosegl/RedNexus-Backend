import { context, propagation, trace } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import {
  BatchSpanProcessor,
  InMemorySpanExporter,
  TracerProvider,
} from '@opentelemetry/sdk-trace';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { recordMatch, runJobSpan, withTraceContext } from './instruments.js';
import { serviceName, telemetryEnabled } from './telemetry.js';

describe('telemetría (PL-07)', () => {
  it('solo se activa con OTEL_EXPORTER_OTLP_ENDPOINT', () => {
    expect(telemetryEnabled({})).toBe(false);
    expect(
      telemetryEnabled({ OTEL_EXPORTER_OTLP_ENDPOINT: 'http://x:4318' }),
    ).toBe(true);
    expect(
      telemetryEnabled({
        OTEL_EXPORTER_OTLP_ENDPOINT: 'http://x:4318',
        OTEL_SDK_DISABLED: 'true',
      }),
    ).toBe(false);
  });

  it('distingue la API del worker por el archivo de entrada', () => {
    expect(serviceName({}, '/app/dist/worker.js')).toBe('rednexus-worker');
    expect(serviceName({}, '/app/dist/main.js')).toBe('rednexus-api');
    expect(serviceName({ OTEL_SERVICE_NAME: 'otro' }, 'x')).toBe('otro');
  });

  it('sin SDK no agrega nada al trabajo y no falla al medir', async () => {
    expect(withTraceContext({ requestId: 'r1' })).toEqual({ requestId: 'r1' });
    recordMatch({ strategy: 'semantic', candidates: 3, latencyMs: 1200 });
    const job = { id: '1', name: 'match', attemptsMade: 0, data: {} };
    await expect(runJobSpan(job, async () => 42)).resolves.toBe(42);
    await expect(
      runJobSpan(job, () => Promise.reject(new Error('falla'))),
    ).rejects.toThrow('falla');
  });

  describe('con SDK', () => {
    const exporter = new InMemorySpanExporter();
    const provider = new TracerProvider({
      spanProcessors: [new BatchSpanProcessor({ exporter })],
    });

    beforeAll(() => {
      context.setGlobalContextManager(
        new AsyncLocalStorageContextManager().enable(),
      );
      propagation.setGlobalPropagator(new W3CTraceContextPropagator());
      trace.setGlobalTracerProvider(provider);
    });
    afterAll(() => {
      trace.disable();
      propagation.disable();
      context.disable();
    });

    it('el span del worker continúa la traza de la API', async () => {
      const tracer = trace.getTracer('prueba');
      let data: ReturnType<typeof withTraceContext<{ requestId: string }>>;
      const traceId = tracer.startActiveSpan('POST /api/help-requests', (s) => {
        data = withTraceContext({ requestId: 'r1' });
        s.end();
        return s.spanContext().traceId;
      });
      expect(data!.otel?.traceparent).toContain(traceId);

      await runJobSpan(
        { id: '7', name: 'match', attemptsMade: 0, data: data! },
        async () => 'ok',
      );
      await provider.forceFlush();
      const job = exporter
        .getFinishedSpans()
        .find((s) => s.name === 'match process');
      expect(job?.spanContext().traceId).toBe(traceId);
      expect(job?.attributes['messaging.system']).toBe('bullmq');
    });
  });
});
