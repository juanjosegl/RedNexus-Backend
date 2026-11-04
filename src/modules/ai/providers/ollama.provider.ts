import {
  AiProvider,
  Classification,
  EMBEDDING_DIMENSIONS,
  HelperProfile,
} from '../ai-provider.js';

export interface OllamaOptions {
  url: string;
  llmModel: string;
  embedModel: string;
  timeoutMs: number;
}

export class OllamaAiProvider implements AiProvider {
  readonly name = 'ollama';

  constructor(private readonly options: OllamaOptions) {}

  async embed(text: string): Promise<number[]> {
    const res = await this.post<{ embeddings: number[][] }>('/api/embed', {
      model: this.options.embedModel,
      input: text,
    });
    const vector = res.embeddings?.[0];
    if (!vector || vector.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Ollama devolvió un embedding de ${vector?.length ?? 0} dimensiones`,
      );
    }
    return vector;
  }

  // TODO IA-03
  async classify(_text: string): Promise<Classification> {
    throw new Error('Clasificación con Ollama pendiente (IA-03)');
  }

  // TODO IA-04
  async explain(_request: string, _helper: HelperProfile): Promise<string> {
    throw new Error('Explicación con Ollama pendiente (IA-04)');
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.options.url}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.options.timeoutMs),
    });
    if (!res.ok)
      throw new Error(
        `Ollama ${path} respondió ${res.status}: ${await res.text()}`,
      );
    return (await res.json()) as T;
  }
}
