import {
  ChatTurn,
  SupportAnswer,
  SupportProvider,
} from '../support-provider.js';

export interface OpenWebUiOptions {
  url: string; // sin /api al final, p. ej. http://localhost:3001
  apiKey: string;
  model: string; // modelo personalizado con la base de conocimiento, p. ej. asistente-rednexus
  timeoutMs: number;
}

// El system prompt y la base de conocimiento viven en el modelo de Open WebUI
// (ver RedNexus-Platform/asistente-rag); aqui solo se reenvia la conversacion.
export class OpenWebUiSupportProvider implements SupportProvider {
  readonly name = 'openwebui';

  constructor(private readonly options: OpenWebUiOptions) {}

  async ask(messages: ChatTurn[]): Promise<SupportAnswer> {
    let res = await this.complete(messages);
    // Open WebUI arma su lista de modelos al consultarla: tras reiniciarse responde
    // "Model not found" hasta que alguien la pide. Se refresca y se reintenta una vez.
    if (res.status === 400) {
      const detail = await res.text();
      if (!detail.includes('Model not found')) throw httpError(400, detail);
      await this.refreshModels();
      res = await this.complete(messages);
    }
    if (!res.ok) throw httpError(res.status, await res.text());
    return parseStream(await res.text());
  }

  // Con stream: true Open WebUI envia primero las fuentes recuperadas; sin stream no las incluye
  private complete(messages: ChatTurn[]) {
    return fetch(`${this.options.url}/api/chat/completions`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        model: this.options.model,
        stream: true,
        messages,
      }),
      signal: AbortSignal.timeout(this.options.timeoutMs),
    });
  }

  private async refreshModels() {
    await fetch(`${this.options.url}/api/models`, {
      headers: this.headers(),
      signal: AbortSignal.timeout(this.options.timeoutMs),
    });
  }

  private headers(extra: Record<string, string> = {}) {
    return { ...extra, Authorization: `Bearer ${this.options.apiKey}` };
  }
}

function httpError(status: number, body: string) {
  return new Error(`Open WebUI respondió ${status}: ${body.slice(0, 200)}`);
}

interface OpenWebUiSource {
  source?: { name?: string };
  metadata?: { name?: string; source?: string }[];
}

interface StreamEvent {
  sources?: OpenWebUiSource[];
  choices?: { delta?: { content?: string } }[];
  error?: { detail?: string } | string;
}

// Lee la respuesta en formato SSE ("data: {...}" por linea, hasta "data: [DONE]")
export function parseStream(body: string): SupportAnswer {
  let answer = '';
  const sources: OpenWebUiSource[] = [];
  for (const line of body.split('\n')) {
    if (!line.startsWith('data:')) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === '[DONE]') continue;
    let event: StreamEvent;
    try {
      event = JSON.parse(payload) as StreamEvent;
    } catch {
      continue;
    }
    if (event.error) {
      const detail =
        typeof event.error === 'string' ? event.error : event.error.detail;
      throw new Error(
        `Open WebUI devolvió un error: ${detail ?? 'sin detalle'}`,
      );
    }
    sources.push(...(event.sources ?? []));
    answer += event.choices?.[0]?.delta?.content ?? '';
  }
  answer = answer.trim();
  if (!answer) throw new Error('Open WebUI no devolvió una respuesta');
  return { answer, sources: documentNames(sources) };
}

// Nombres de los documentos usados (pqrs.md, normas.md...), sin repetir
export function documentNames(sources: OpenWebUiSource[]): string[] {
  const names = sources.flatMap((s) =>
    s.metadata?.length
      ? s.metadata.map((m) => m.name ?? m.source)
      : [s.source?.name],
  );
  return [
    ...new Set(
      names.filter((n): n is string => typeof n === 'string' && n.length > 0),
    ),
  ];
}
