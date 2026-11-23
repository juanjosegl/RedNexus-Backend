import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserDto } from './user.dto.js';

export class ProfileDto extends UserDto {
  @ApiPropertyOptional({
    example: 4.5,
    description: 'Promedio de calificaciones (1 a 5); null si no tiene',
    nullable: true,
  })
  rating: number | null;
}

// Perfil publico (sin email)
export class PublicProfileDto {
  @ApiProperty({
    example: '3f1c2a9e-8b7d-4c1e-9f0a-1b2c3d4e5f60',
    description: 'Identificador único del usuario',
  })
  id: string;

  @ApiProperty({
    example: 'Ana Gómez',
    description: 'Nombre visible en el perfil',
  })
  name: string;

  @ApiPropertyOptional({
    example:
      'Sé SQL, joins y modelado entidad-relación. Fui monitora de Bases de Datos I.',
    description:
      'Habilidades en texto libre: es lo que la IA compara con cada solicitud',
    nullable: true,
  })
  bio: string | null;

  @ApiProperty({
    example: ['bases-de-datos', 'sql', 'intermedio'],
    description: 'Etiquetas de habilidades del usuario',
  })
  tags: string[];

  @ApiPropertyOptional({
    example: 4.5,
    description: 'Promedio de calificaciones (1 a 5); null si no tiene',
    nullable: true,
  })
  rating: number | null;
}
