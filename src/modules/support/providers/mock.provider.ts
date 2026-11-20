import {
  ChatTurn,
  SupportAnswer,
  SupportProvider,
} from '../support-provider.js';

// Respuesta fija para pruebas y para la demo desplegada sin Open WebUI.
// Las respuestas por palabra clave (registro, solicitudes, calificaciones...) se agregan en BE-08.
export const MOCK_DEFAULT_ANSWER =
  'Soy el asistente de RedNexus en modo de demostración. ' +
  'Puedo orientarte sobre el registro, las solicitudes de ayuda, el emparejamiento y las calificaciones. ' +
  'Si tu caso no se resuelve aquí, revisa las preguntas frecuentes de la página de ayuda.';

export class MockSupportProvider implements SupportProvider {
  readonly name = 'mock';

  ask(_messages: ChatTurn[]): Promise<SupportAnswer> {
    return Promise.resolve({ answer: MOCK_DEFAULT_ANSWER, sources: [] });
  }
}
