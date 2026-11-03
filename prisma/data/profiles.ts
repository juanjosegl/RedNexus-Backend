// Perfiles 100 % ficticios (Ley 1581): nombres inventados y emails del dominio rednexus.dev.
// El dataset completo para MLflow (IA-06) vive en RedNexus-Platform/ml/data.

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
  // Cuenta para pedir ayuda en la demo: sin habilidades, así no aparece como candidata
  {
    email: 'estudiante.demo@rednexus.dev',
    name: 'Estudiante Demo',
    bio: null,
    tags: [],
  },
];
