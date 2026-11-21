// PL-07: arranque de OpenTelemetry (trazas y métricas) para la API y el worker.
//
// Debe ser el PRIMER import de src/main.ts y src/worker.ts, para que la instrumentación de
// http quede puesta antes de que Nest cargue ese módulo. La ruta de cada petición la pone
// HttpRouteInterceptor (la instrumentación de express no funciona con Nest en ESM).
//
// Se activa solo si existe OTEL_EXPORTER_OTLP_ENDPOINT (y OTEL_SDK_DISABLED no es "true").
// Sin esa variable no se carga nada: el CI, las pruebas y el desarrollo no cambian.
//
//   Local (Grafana + Tempo + Prometheus en un contenedor, ver RedNexus-Platform/observabilidad):
//     OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
//   Grafana Cloud (plan gratuito):
//     OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-<región>.grafana.net/otlp
//     OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <base64 de instancia:token>
//
// El nombre del servicio sale de OTEL_SERVICE_NAME o, si no está, del proceso
// (rednexus-worker para dist/worker, rednexus-api para lo demás).
import { context, metrics, propagation, trace } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor, TracerProvider } from '@opentelemetry/sdk-trace';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

export function telemetryEnabled(env: NodeJS.ProcessEnv = process.env) {
  return (
    Boolean(env.OTEL_EXPORTER_OTLP_ENDPOINT) && env.OTEL_SDK_DISABLED !== 'true'
  );
}

export function serviceName(
  env: NodeJS.ProcessEnv = process.env,
  entry = process.argv[1] ?? '',
) {
  if (env.OTEL_SERVICE_NAME) return env.OTEL_SERVICE_NAME;
  return /worker(\.[cm]?[jt]s)?$/.test(entry)
    ? 'rednexus-worker'
    : 'rednexus-api';
}

function start() {
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName(),
    [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? '0.1.0',
    'deployment.environment.name': process.env.NODE_ENV ?? 'development',
  });

  context.setGlobalContextManager(
    new AsyncLocalStorageContextManager().enable(),
  );
  propagation.setGlobalPropagator(
    new CompositePropagator({
      propagators: [
        new W3CTraceContextPropagator(),
        new W3CBaggagePropagator(),
      ],
    }),
  );

  // Los exportadores leen OTEL_EXPORTER_OTLP_ENDPOINT y OTEL_EXPORTER_OTLP_HEADERS
  const tracerProvider = new TracerProvider({
    resource,
    spanProcessors: [
      new BatchSpanProcessor({ exporter: new OTLPTraceExporter() }),
    ],
  });
  trace.setGlobalTracerProvider(tracerProvider);

  const meterProvider = new MeterProvider({
    resource,
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: 15_000,
      }),
    ],
  });
  metrics.setGlobalMeterProvider(meterProvider);

  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation({
        // las sondas de Kubernetes llaman /api/health cada 5 s: no son tráfico real
        ignoreIncomingRequestHook: (req) =>
          req.url?.startsWith('/api/health') ?? false,
      }),
    ],
  });

  // Al recibir SIGTERM, Nest cierra la app; aquí se envía lo que quede en memoria
  const shutdown = () =>
    Promise.allSettled([
      tracerProvider.shutdown(),
      meterProvider.shutdown(),
    ]).then(() => undefined);
  process.once('beforeExit', shutdown);
  process.once('SIGTERM', () => void shutdown());
}

if (telemetryEnabled()) start();
