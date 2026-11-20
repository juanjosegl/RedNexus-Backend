// Perfiles ficticios para la demo (Ley 1581): ningún dato es de una persona real.
// Generado por RedNexus-Platform/ml/scripts/export_seed.py desde ml/data/profiles.json (IA-06).
// No editar a mano: cambia el dataset y vuelve a correr el script.

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
  {
    email: 'julian.demo@rednexus.dev',
    name: 'Julián Ceballos',
    bio: 'Consultas SQL desde lo básico: SELECT, filtros con WHERE, GROUP BY, HAVING y subconsultas. Monitor de Bases de Datos.',
    tags: ['bases-de-datos', 'sql', 'basico'],
  },
  {
    email: 'natalia.demo@rednexus.dev',
    name: 'Natalia Quintero',
    bio: 'Modelado de datos: diagramas entidad-relación, cardinalidades y normalización hasta tercera forma normal.',
    tags: ['bases-de-datos', 'modelado', 'normalizacion'],
  },
  {
    email: 'esteban.demo@rednexus.dev',
    name: 'Esteban Muñoz',
    bio: 'MySQL en producción: procedimientos almacenados, triggers, vistas, usuarios y copias de seguridad.',
    tags: ['bases-de-datos', 'mysql', 'administracion'],
  },
  {
    email: 'gabriela.demo@rednexus.dev',
    name: 'Gabriela Ospina',
    bio: 'Python intermedio: clases y objetos en Python, manejo de excepciones, lectura de archivos, módulos y entornos virtuales con venv.',
    tags: ['programacion', 'python', 'intermedio'],
  },
  {
    email: 'kevin.demo@rednexus.dev',
    name: 'Kevin Anacona',
    bio: 'C y C++: punteros, memoria dinámica con malloc y new, structs, compilación con gcc y make.',
    tags: ['programacion', 'c', 'cpp'],
  },
  {
    email: 'luisa.demo@rednexus.dev',
    name: 'Luisa Fernanda Rojas',
    bio: 'Maquetación web: HTML semántico, CSS, Flexbox, Grid, diseño responsive y accesibilidad.',
    tags: ['programacion', 'web', 'css', 'frontend'],
  },
  {
    email: 'cristian.demo@rednexus.dev',
    name: 'Cristian Yalanda',
    bio: 'Desarrollo móvil Android con Kotlin y Jetpack Compose: pantallas, listas, navegación y ciclo de vida.',
    tags: ['programacion', 'kotlin', 'android', 'movil'],
  },
  {
    email: 'manuela.demo@rednexus.dev',
    name: 'Manuela Arboleda',
    bio: 'JavaScript asíncrono: callbacks, promesas, async/await, fetch y el event loop del navegador.',
    tags: ['programacion', 'javascript', 'asincronia'],
  },
  {
    email: 'jhon.demo@rednexus.dev',
    name: 'Jhon Fredy Palechor',
    bio: 'Backend en Java con Spring Boot: controladores REST, JPA, Hibernate y conexión a bases de datos.',
    tags: ['programacion', 'java', 'spring-boot', 'backend'],
  },
  {
    email: 'diana.demo@rednexus.dev',
    name: 'Diana Marcela Solarte',
    bio: 'Ecuaciones diferenciales ordinarias: separables, lineales, de segundo orden y transformada de Laplace.',
    tags: ['matematicas', 'ecuaciones-diferenciales', 'laplace'],
  },
  {
    email: 'ricardo.demo@rednexus.dev',
    name: 'Ricardo Benavides',
    bio: 'Cálculo multivariable: derivadas parciales, gradiente, integrales dobles y triples, coordenadas polares y esféricas.',
    tags: ['matematicas', 'calculo-vectorial', 'multivariable'],
  },
  {
    email: 'valeria.demo@rednexus.dev',
    name: 'Valeria Muñoz',
    bio: 'Precálculo y álgebra básica: factorización, fracciones algebraicas, funciones, trigonometría y logaritmos.',
    tags: ['matematicas', 'precalculo', 'algebra', 'basico'],
  },
  {
    email: 'carolina.demo@rednexus.dev',
    name: 'Carolina Idrobo',
    bio: 'Probabilidad: técnicas de conteo, permutaciones, combinaciones, teorema de Bayes y variables aleatorias.',
    tags: ['matematicas', 'probabilidad', 'conteo'],
  },
  {
    email: 'andrea.demo@rednexus.dev',
    name: 'Andrea Collazos',
    bio: 'Redes conmutadas e inalámbricas: VLAN, enrutamiento entre VLAN, firewalls, WiFi y prácticas en Packet Tracer.',
    tags: ['redes', 'vlan', 'packet-tracer', 'firewall'],
  },
  {
    email: 'oscar.demo@rednexus.dev',
    name: 'Óscar Mosquera',
    bio: 'Administración de Linux: terminal, scripts en bash, permisos, procesos, ssh, cron y firewall con ufw.',
    tags: ['cloud-devops', 'linux', 'bash'],
  },
  {
    email: 'melissa.demo@rednexus.dev',
    name: 'Melissa Burbano',
    bio: 'Nube en AWS: EC2, S3, IAM, redes VPC e infraestructura como código con Terraform.',
    tags: ['cloud-devops', 'aws', 'terraform'],
  },
  {
    email: 'brayan.demo@rednexus.dev',
    name: 'Brayan Ijají',
    bio: 'Integración y entrega continua: pipelines en GitHub Actions y Jenkins, pruebas automáticas y despliegues.',
    tags: ['cloud-devops', 'ci-cd', 'github-actions', 'jenkins'],
  },
  {
    email: 'juliana.demo@rednexus.dev',
    name: 'Juliana Cerón',
    bio: 'Inglés conversacional: speaking, pronunciación, listening y preparación de entrevistas de trabajo en inglés.',
    tags: ['ingles', 'speaking', 'pronunciacion'],
  },
  {
    email: 'alexander.demo@rednexus.dev',
    name: 'Alexander Lasso',
    bio: 'Inglés técnico para ingeniería: leer documentación, artículos científicos y vocabulario de software en inglés.',
    tags: ['ingles', 'ingles-tecnico', 'lectura'],
  },
  {
    email: 'lorena.demo@rednexus.dev',
    name: 'Lorena Calambás',
    bio: 'Física de electricidad y magnetismo: ley de Coulomb, campo eléctrico, ley de Gauss, ley de Ohm, inducción y ley de Faraday.',
    tags: ['fisica', 'electromagnetismo', 'electricidad'],
  },
  {
    email: 'hector.demo@rednexus.dev',
    name: 'Héctor Mueses',
    bio: 'Física de ondas, óptica y termodinámica: interferencia, calor, gases ideales y leyes de la termodinámica.',
    tags: ['fisica', 'ondas', 'termodinamica'],
  },
  {
    email: 'ximena.demo@rednexus.dev',
    name: 'Ximena Vidal',
    bio: 'Química general: estequiometría, balanceo de ecuaciones, óxido-reducción, reactivo límite y tabla periódica.',
    tags: ['quimica', 'estequiometria'],
  },
  {
    email: 'mauricio.demo@rednexus.dev',
    name: 'Mauricio Dorado',
    bio: 'Electrónica digital: compuertas lógicas, álgebra de Boole, mapas de Karnaugh, flip-flops y proyectos con Arduino.',
    tags: ['electronica', 'digital', 'arduino'],
  },
  {
    email: 'veronica.demo@rednexus.dev',
    name: 'Verónica Paredes',
    bio: 'Sistemas operativos: procesos e hilos, planificación de CPU, concurrencia, semáforos, interbloqueos y memoria virtual.',
    tags: ['sistemas-operativos', 'concurrencia', 'hilos'],
  },
  {
    email: 'fernando.demo@rednexus.dev',
    name: 'Fernando Ordóñez',
    bio: 'Arquitectura y diseño de software: principios SOLID, código limpio, patrones de diseño, MVC y microservicios.',
    tags: ['ingenieria-de-software', 'arquitectura', 'solid', 'patrones'],
  },
  {
    email: 'lina.demo@rednexus.dev',
    name: 'Lina Marcela Gaviria',
    bio: 'Pruebas de software: pruebas unitarias, mocks, TDD, pruebas de integración con Jest y JUnit.',
    tags: ['ingenieria-de-software', 'testing', 'tdd'],
  },
  {
    email: 'pablo.demo@rednexus.dev',
    name: 'Pablo Andrés Chávez',
    bio: 'Deep learning con PyTorch y TensorFlow: redes neuronales, redes convolucionales y visión por computador.',
    tags: ['ia', 'deep-learning', 'vision'],
  },
  {
    email: 'adriana.demo@rednexus.dev',
    name: 'Adriana Montenegro',
    bio: 'Procesamiento de lenguaje natural y LLM: embeddings, búsqueda semántica, RAG, prompts y Hugging Face.',
    tags: ['ia', 'nlp', 'llm', 'rag'],
  },
  {
    email: 'ivan.demo@rednexus.dev',
    name: 'Iván Darío Pino',
    bio: 'Hacking ético: pentesting, Kali Linux, escaneo con nmap, análisis de vulnerabilidades y retos CTF.',
    tags: ['seguridad', 'pentesting', 'kali'],
  },
  {
    email: 'monica.demo@rednexus.dev',
    name: 'Mónica Sandoval',
    bio: 'Redacción académica y metodología de investigación: normas APA 7, anteproyectos, planteamiento del problema y objetivos.',
    tags: ['investigacion', 'apa', 'redaccion'],
  },
  // sin habilidades: solo pide ayuda
  {
    email: 'estudiante.demo@rednexus.dev',
    name: 'Estudiante Demo',
    bio: null,
    tags: [],
  },
];
