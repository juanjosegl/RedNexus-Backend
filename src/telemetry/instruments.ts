// PL-07: trazas de los trabajos de BullMQ y métricas del emparejamiento.
//
// Con OpenTelemetry apagado (sin OTEL_EXPORTER_OTLP_ENDPOINT) la API de @opentelemetry/api
// responde con implementaciones vacías: estas funciones no hacen nada y no cuestan nada.
import {
  context,
  metrics,
  propagation,
  SpanKind,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';

const SCOPE = 'rednexus';

// Límites del histograma en segundos. El 30 es el del SLO: "el 95 % de las solicitudes
// recibe candidatos en menos de 30 s"; los demás dan la forma de la distribución.
export const LATENCY_BUCKETS_S = [0.5, 1, 2, 5, 10, 20, 30, 60, 120];

const meter = () => metrics.getMeter(SCOPE);
const tracer = () => trace.getTracer(SCOPE);

/** Contexto de traza que viaja dentro de los datos de un trabajo de BullMQ. */
export interface TracedJobData {
  otel?: Record<string, string>;
}

/**
 * Agrega al trabajo el contexto de la traza actual (cabecera W3C traceparent), para que
 * el span del worker quede como hijo de la petición HTTP que lo encoló.
 */
export function withTraceContext<T extends object>(data: T): T & TracedJobData {
  const carrier: Record<string, string> = {};
  propagation.inject(context.active(), carrier);
  return Object.keys(carrier).length ? { ...data, otel: carrier } : data;
}

interface JobLike {
  id?: string;
  name: string;
  attemptsMade: number;
  data: unknown;
}

let jobDuration: ReturnType<ReturnType<typeof meter>['createHistogram']>;

/** Ejecuta un trabajo del worker dentro de un span que continúa la traza de la API. */
export async function runJobSpan<T>(job: JobLike, fn: () => Promise<T>) {
  const carrier = (job.data as TracedJobData | undefined)?.otel ?? {};
  const parent = propagation.extract(context.active(), carrier);
  jobDuration ??= meter().createHistogram('rednexus.job.duration', {
    description: 'Duración de cada trabajo de IA en el worker',
    unit: 's',
    advice: { explicitBucketBoundaries: LATENCY_BUCKETS_S },
  });
  const started = performance.now();
  return tracer().startActiveSpan(
    `${job.name} process`,
    {
      kind: SpanKind.CONSUMER,
      attributes: {
        'messaging.system': 'bullmq',
        'messaging.destination.name': 'ai',
        'messaging.message.id': job.id ?? '',
        'messaging.operation.type': 'process',
        'rednexus.job.attempt': job.attemptsMade + 1,
      },
    },
    parent,
    async (span) => {
      let outcome = 'ok';
      try {
        return await fn();
      } catch (error) {
        outcome = 'error';
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw error;
      } finally {
        jobDuration.record((performance.now() - started) / 1000, {
          'rednexus.job.name': job.name,
          outcome,
        });
        span.end();
      }
    },
  );
}

let matchLatency: ReturnType<ReturnType<typeof meter>['createHistogram']>;

/**
 * Registra el resultado de un emparejamiento. `latencyMs` es el tiempo desde que la
 * solicitud se creó hasta que tiene candidatos: es la medida del SLO (SLI).
 */
export function recordMatch(result: {
  strategy: string;
  candidates: number;
  latencyMs?: number;
}) {
  if (result.strategy === 'skipped' || result.latencyMs === undefined) return;
  matchLatency ??= meter().createHistogram('rednexus.match.latency', {
    description:
      'Tiempo desde que se crea la solicitud hasta que recibe candidatos (SLO: 95 % < 30 s)',
    unit: 's',
    advice: { explicitBucketBoundaries: LATENCY_BUCKETS_S },
  });
  const attributes = {
    strategy: result.strategy,
    with_candidates: result.candidates > 0,
  };
  matchLatency.record(result.latencyMs / 1000, attributes);
  trace.getActiveSpan()?.setAttributes({
    'rednexus.match.strategy': result.strategy,
    'rednexus.match.candidates': result.candidates,
    'rednexus.match.latency_ms': result.latencyMs,
  });
}
