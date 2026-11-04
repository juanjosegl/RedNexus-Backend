import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Ana Gómez' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(2, 80)
  name?: string;

  @ApiPropertyOptional({
    example:
      'Sé SQL, joins y modelado entidad-relación. Fui monitora de Bases de Datos I.',
    description:
      'Habilidades en texto libre: es lo que la IA compara con cada solicitud',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({ example: ['bases-de-datos', 'sql', 'intermedio'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(15)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? [
          ...new Set(
            value.map((t) => String(t).trim().toLowerCase()).filter(Boolean),
          ),
        ]
      : value,
  )
  tags?: string[];
}
