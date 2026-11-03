import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Sin passwordHash ni embedding
export class UserDto {
  @ApiProperty({ example: '3f1c2a9e-8b7d-4c1e-9f0a-1b2c3d4e5f60' })
  id: string;

  @ApiProperty({ example: 'ana.demo@rednexus.dev' })
  email: string;

  @ApiProperty({ example: 'Ana (demo)' })
  name: string;

  @ApiPropertyOptional({
    example: 'Sé SQL, joins y modelado de bases de datos',
  })
  bio: string | null;

  @ApiProperty({ example: ['bases-de-datos', 'intermedio'] })
  tags: string[];
}

export const userSelect = {
  id: true,
  email: true,
  name: true,
  bio: true,
  tags: true,
} as const;
