// Asistente de soporte (RAG): Open WebUI (real) o mock (pruebas y demo sin IA), segun SUPPORT_PROVIDER

export const SUPPORT_PROVIDER = Symbol('SUPPORT_PROVIDER');

export type ChatRole = 'user' | 'assistant';

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export interface SupportAnswer {
  answer: string;
  // nombres de los documentos de la base de conocimiento que uso la respuesta
  sources: string[];
}

export interface SupportProvider {
  readonly name: string;
  ask(messages: ChatTurn[]): Promise<SupportAnswer>;
}
