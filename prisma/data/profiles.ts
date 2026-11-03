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
  // sin habilidades: solo pide ayuda
  {
    email: 'estudiante.demo@rednexus.dev',
    name: 'Estudiante Demo',
    bio: null,
    tags: [],
  },
];
