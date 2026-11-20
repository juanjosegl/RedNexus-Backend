import {
  ChatTurn,
  SupportAnswer,
  SupportProvider,
} from '../support-provider.js';

// Respuesta por defecto para la demo desplegada sin Open WebUI.
export const MOCK_DEFAULT_ANSWER =
  'Soy el asistente de RedNexus en modo de demostración. ' +
  'Puedo orientarte sobre el registro, las solicitudes de ayuda, el emparejamiento y las calificaciones. ' +
  'Si tu caso no se resuelve aquí, revisa las preguntas frecuentes de la página de ayuda.';

interface MockTopic {
  // fragmentos en minúsculas y sin tildes; basta con que uno aparezca
  keywords: string[];
  answer: string;
  // documento de asistente-rag/knowledge-base/ en RedNexus-Platform
  source: string;
}

// El orden importa: gana el primer tema cuya palabra clave aparezca.
// Calificaciones va antes que solicitudes porque "califico a mi ayudante" también habla de ayuda.
export const MOCK_TOPICS: readonly MockTopic[] = [
  {
    keywords: ['calific', 'estrella', 'puntua'],
    answer:
      'Solo el autor de una solicitud aceptada o cerrada puede calificar a quien lo ayudó, de 1 a 5 estrellas y una sola vez. ' +
      'La calificación promedio cuenta en el emparejamiento; quien no tiene calificaciones cuenta como 3 de 5.',
    source: 'calificaciones.md',
  },
  {
    keywords: ['pqrs', 'queja', 'reclamo', 'sugerencia', 'peticion'],
    answer:
      'Entra a Ayuda y pulsa Radicar una PQRS. Elige el tipo, escribe un asunto (5 a 120 caracteres) y una descripción (20 a 2000) y pulsa Radicar. ' +
      'Guarda el número de radicado que te muestra la plataforma.',
    source: 'pqrs.md',
  },
  {
    keywords: [
      'privacidad',
      'mis datos',
      'datos personales',
      '1581',
      'eliminar mi cuenta',
      'borrar mi cuenta',
    ],
    answer:
      'RedNexus trata tus datos según la Ley 1581 de 2012 y solo para conectarte con quien te puede ayudar. ' +
      'Desde Mi perfil puedes descargar tus datos o eliminar tu cuenta, y tu correo solo lo ve quien acepta ayudarte.',
    source: 'privacidad.md',
  },
  {
    keywords: ['candidat', 'emparej', 'match', 'quien me ayud', 'encuentr'],
    answer:
      'Cuando publicas una duda, la IA la clasifica, la compara con la descripción y las etiquetas de los perfiles y te propone hasta 3 candidatos, ' +
      'cada uno con una frase que explica por qué encaja. Si nadie en la red sabe del tema, la solicitud queda sin candidatos.',
    source: 'emparejamiento.md',
  },
  {
    keywords: [
      'registr',
      'cuenta',
      'contrasena',
      'iniciar sesion',
      'cerrar sesion',
    ],
    answer:
      'Pulsa Registrarse en el menú y completa tu nombre (2 a 80 caracteres), tu correo y una contraseña de 8 a 72 caracteres. ' +
      'Al pulsar Registrarme entras al inicio con la sesión ya iniciada.',
    source: 'registro-y-perfil.md',
  },
  {
    keywords: ['perfil', 'etiqueta', 'descripcion'],
    answer:
      'Pulsa tu nombre en el menú para abrir Mi perfil y luego Editar perfil. Puedes cambiar tu nombre, tu descripción (hasta 1000 caracteres) ' +
      'y hasta 15 etiquetas; el emparejamiento las usa para proponerte como ayudante.',
    source: 'registro-y-perfil.md',
  },
  {
    keywords: ['solicitud', 'duda', 'publica', 'pedir ayuda', 'nota de voz'],
    answer:
      'En el inicio pulsa Nueva solicitud, escribe tu duda (de 10 a 1000 caracteres) o graba una nota de voz y pulsa Publicar. ' +
      'La solicitud pasa de Pendiente a Con candidatos cuando la IA encuentra compañeros, y puedes cerrarla cuando ya no necesites ayuda.',
    source: 'solicitudes-de-ayuda.md',
  },
];

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export class MockSupportProvider implements SupportProvider {
  readonly name = 'mock';

  ask(messages: ChatTurn[]): Promise<SupportAnswer> {
    const last = [...messages].reverse().find((m) => m.role === 'user');
    const question = normalize(last?.content ?? '');
    const topic = MOCK_TOPICS.find((t) =>
      t.keywords.some((keyword) => question.includes(keyword)),
    );
    return Promise.resolve(
      topic
        ? { answer: topic.answer, sources: [topic.source] }
        : { answer: MOCK_DEFAULT_ANSWER, sources: [] },
    );
  }
}
