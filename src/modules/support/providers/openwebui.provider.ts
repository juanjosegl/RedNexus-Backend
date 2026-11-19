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
// (ver el repo RedNexus-Asistente-RAG); aqui solo se reenvia la conversacion.
export class OpenWebUiSupportProvider implements SupportProvider {
  readonly name = 'openwebui';

  constructor(private readonly options: OpenWebUiOptions) {}

  async ask(messages: ChatTurn[]): Promise<SupportAnswer> {
    const res = await fetch(`${this.options.url}/api/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.options.apiKey}`,
      },
      body: JSON.stringify({
        model: this.options.model,
        stream: false,
        messages,
      }),
      signal: AbortSignal.timeout(this.options.timeoutMs),
    });
    if (!res.ok) {
      throw new Error(
        `Open WebUI respondió ${res.status}: ${(await res.text()).slice(0, 200)}`,
      );
    }
    return parseCompletion(await res.json());
  }
}

interface OpenWebUiSource {
  source?: { name?: string; id?: string };
  metadata?: { name?: string; source?: string }[];
}

interface OpenWebUiCompletion {
  choices?: { message?: { content?: string } }[];
  sources?: OpenWebUiSource[];
}

// Respuesta en formato OpenAI; Open WebUI agrega "sources" cuando usa la base de conocimiento
export function parseCompletion(data: unknown): SupportAnswer {
  const completion = data as OpenWebUiCompletion;
  const answer = completion?.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error('Open WebUI no devolvió una respuesta');

  const names = (completion.sources ?? []).flatMap((s) => [
    ...(s.metadata ?? []).map((m) => m.name ?? m.source),
    s.source?.name,
  ]);
  const sources = [
    ...new Set(
      names.filter((n): n is string => typeof n === 'string' && n.length > 0),
    ),
  ];
  return { answer, sources };
}
