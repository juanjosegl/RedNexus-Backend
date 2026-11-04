// Perfiles ficticios para la demo (Ley 1581)

export interface SeedProfile {
  email: string;
  name: string;
  bio: string | null;
  tags: string[];
}

export const profiles: SeedProfile[] = [
  {
    email: 'ana.demo@rednexus.dev',
    name: 'Ana Gómez',
    bio: 'Sé SQL, joins entre tablas, relaciones muchos a muchos y modelado entidad-relación. Fui monitora de Bases de Datos I.',
    tags: ['bases-de-datos', 'sql', 'modelado', 'intermedio'],
  },
  {
    email: 'carlos.demo@rednexus.dev',
    name: 'Carlos Muñoz',
    bio: 'PostgreSQL avanzado: índices, optimización de consultas lentas, transacciones y procedimientos almacenados.',
    tags: ['bases-de-datos', 'postgresql', 'optimizacion', 'avanzado'],
  },
  {
    email: 'laura.demo@rednexus.dev',
    name: 'Laura Ordóñez',
    bio: 'Programo en Python desde el colegio. Puedo explicar funciones, bucles, listas, diccionarios y recursión desde cero.',
    tags: ['programacion', 'python', 'basico'],
  },
  {
    email: 'andres.demo@rednexus.dev',
    name: 'Andrés Caicedo',
    bio: 'Programación orientada a objetos en Java: clases, herencia, interfaces, polimorfismo y patrones de diseño.',
    tags: ['programacion', 'java', 'poo', 'intermedio'],
  },
  {
    email: 'valentina.demo@rednexus.dev',
    name: 'Valentina Ruiz',
    bio: 'Desarrollo web con JavaScript, TypeScript y Vue 3. También ayudo con HTML, CSS y consumo de APIs REST.',
    tags: ['programacion', 'javascript', 'vue', 'web'],
  },
  {
    email: 'juan.demo@rednexus.dev',
    name: 'Juan Pablo Torres',
    bio: 'Backend con Node.js y NestJS, APIs REST, autenticación con JWT y pruebas unitarias.',
    tags: ['programacion', 'nestjs', 'backend', 'avanzado'],
  },
  {
    email: 'sofia.demo@rednexus.dev',
    name: 'Sofía Paz',
    bio: 'Cálculo diferencial e integral: límites, derivadas, regla de la cadena e integrales por partes.',
    tags: ['matematicas', 'calculo', 'derivadas', 'integrales'],
  },
  {
    email: 'mateo.demo@rednexus.dev',
    name: 'Mateo Hurtado',
    bio: 'Álgebra lineal: matrices, determinantes, sistemas de ecuaciones, vectores y valores propios.',
    tags: ['matematicas', 'algebra-lineal', 'matrices'],
  },
  {
    email: 'isabella.demo@rednexus.dev',
    name: 'Isabella Castro',
    bio: 'Estadística y probabilidad: distribuciones, pruebas de hipótesis, regresión lineal. Uso Excel y R.',
    tags: ['matematicas', 'estadistica', 'probabilidad'],
  },
  {
    email: 'santiago.demo@rednexus.dev',
    name: 'Santiago Bolaños',
    bio: 'Matemáticas discretas y lógica: conjuntos, grafos, inducción matemática y combinatoria.',
    tags: ['matematicas', 'discretas', 'grafos', 'logica'],
  },
  {
    email: 'daniela.demo@rednexus.dev',
    name: 'Daniela Velasco',
    bio: 'Redes de computadores: modelo OSI, TCP/IP, subredes, máscaras, DNS y configuración de routers Cisco.',
    tags: ['redes', 'tcp-ip', 'subredes', 'cisco'],
  },
  {
    email: 'felipe.demo@rednexus.dev',
    name: 'Felipe Rengifo',
    bio: 'Docker, contenedores, Kubernetes y despliegue continuo con GitHub Actions. Administro servidores Linux.',
    tags: ['cloud-devops', 'docker', 'kubernetes', 'linux'],
  },
  {
    email: 'camila.demo@rednexus.dev',
    name: 'Camila Mosquera',
    bio: 'Git y GitHub: ramas, merge, rebase, resolver conflictos y flujo de pull requests en equipo.',
    tags: ['programacion', 'git', 'colaboracion'],
  },
  {
    email: 'nicolas.demo@rednexus.dev',
    name: 'Nicolás Erazo',
    bio: 'Estructuras de datos y algoritmos: listas enlazadas, árboles, pilas, colas, ordenamiento y complejidad Big O.',
    tags: ['programacion', 'algoritmos', 'estructuras-de-datos'],
  },
  {
    email: 'mariana.demo@rednexus.dev',
    name: 'Mariana López',
    bio: 'Inglés nivel B2: gramática, tiempos verbales, redacción de ensayos y preparación para exámenes de inglés.',
    tags: ['ingles', 'gramatica', 'writing'],
  },
  {
    email: 'sebastian.demo@rednexus.dev',
    name: 'Sebastián Chicangana',
    bio: 'Física mecánica: cinemática, leyes de Newton, fuerza, trabajo y energía. También circuitos eléctricos básicos.',
    tags: ['fisica', 'mecanica', 'circuitos'],
  },
  {
    email: 'paula.demo@rednexus.dev',
    name: 'Paula Fernández',
    bio: 'Machine learning con Python: pandas, scikit-learn, regresión, clasificación y evaluación de modelos.',
    tags: ['programacion', 'python', 'machine-learning', 'datos'],
  },
  {
    email: 'david.demo@rednexus.dev',
    name: 'David Imbachí',
    bio: 'Bases de datos NoSQL con MongoDB, diseño de documentos y consultas de agregación.',
    tags: ['bases-de-datos', 'mongodb', 'nosql'],
  },
  {
    email: 'alejandra.demo@rednexus.dev',
    name: 'Alejandra Rivera',
    bio: 'Ingeniería de software: requisitos, historias de usuario, diagramas UML, casos de uso y Scrum.',
    tags: ['ingenieria-de-software', 'uml', 'requisitos', 'scrum'],
  },
  {
    email: 'tomas.demo@rednexus.dev',
    name: 'Tomás Guerrero',
    bio: 'Seguridad informática: OWASP Top 10, inyección SQL, XSS, cifrado y buenas prácticas de contraseñas.',
    tags: ['seguridad', 'owasp', 'cifrado'],
  },
  // sin habilidades: solo pide ayuda
  {
    email: 'estudiante.demo@rednexus.dev',
    name: 'Estudiante Demo',
    bio: null,
    tags: [],
  },
];
