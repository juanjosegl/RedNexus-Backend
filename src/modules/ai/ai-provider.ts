// Interfaz de la IA: Ollama (real) o mock (pruebas), segun AI_PROVIDER

export const AI_PROVIDER = Symbol('AI_PROVIDER');

// nomic-embed-text -> vector(768)
export const EMBEDDING_DIMENSIONS = 768;

export interface Classification {
  area: string;
  topics: string[];
  level: 'basico' | 'intermedio' | 'avanzado';
}

// Datos del perfil que recibe el LLM (RAG)
export interface HelperProfile {
  name: string;
  bio: string | null;
  tags: string[];
}

export interface AiProvider {
  readonly name: string;
  embed(text: string): Promise<number[]>;
  classify(text: string): Promise<Classification>;
  explain(request: string, helper: HelperProfile): Promise<string>;
}

export function profileText(profile: HelperProfile): string {
  return [profile.bio ?? '', profile.tags.join(', ')]
    .filter(Boolean)
    .join('\n');
}
