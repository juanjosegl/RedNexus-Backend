import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserDto } from './user.dto.js';

export class ProfileDto extends UserDto {
  @ApiPropertyOptional({
    example: 4.5,
    description: 'Promedio de calificaciones (1 a 5); null si no tiene',
  })
  rating: number | null;
}

// Perfil publico (sin email)
export class PublicProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  bio: string | null;

  @ApiProperty()
  tags: string[];

  @ApiPropertyOptional({ example: 4.5 })
  rating: number | null;
}
