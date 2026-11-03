import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';
import { MatchStatus, RequestStatus } from '../../../generated/prisma/enums.js';

export class CreateHelpRequestDto {
  @ApiProperty({
    example:
      'No entiendo cómo hacer joins en SQL con tablas que tienen relaciones muchos a muchos',
    minLength: 10,
    maxLength: 1000,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(10, 1000)
  text: string;
}

export class CreatedHelpRequestDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: RequestStatus, example: RequestStatus.PENDING })
  status: RequestStatus;
}

export class HelpRequestSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiPropertyOptional({
    example: 'bases-de-datos',
    description: 'Clasificación del LLM',
  })
  area: string | null;

  @ApiProperty({ example: ['sql', 'joins'] })
  topics: string[];

  @ApiPropertyOptional({ example: 'intermedio' })
  level: string | null;

  @ApiProperty({ enum: RequestStatus })
  status: RequestStatus;

  @ApiProperty()
  createdAt: Date;
}

export class MatchHelperDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Ana (demo)' })
  name: string;

  @ApiPropertyOptional()
  bio: string | null;

  @ApiProperty({ example: ['bases-de-datos'] })
  tags: string[];

  @ApiPropertyOptional({
    description: 'Solo aparece cuando el ayudante aceptó',
  })
  email?: string;
}

export class MatchDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    example: 0.83,
    description: 'Similitud y calificación combinadas, de 0 a 1',
  })
  score: number;

  @ApiPropertyOptional({
    example: 'Ana encaja porque su perfil menciona: sql, joins.',
  })
  explanation: string | null;

  @ApiProperty({ enum: MatchStatus })
  status: MatchStatus;

  @ApiProperty({ type: MatchHelperDto })
  helper: MatchHelperDto;
}

export class HelpRequestDetailDto extends HelpRequestSummaryDto {
  @ApiProperty({ type: [MatchDto] })
  matches: MatchDto[];
}
