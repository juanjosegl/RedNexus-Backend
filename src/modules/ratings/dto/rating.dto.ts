import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({ example: '3f1c2a9e-8b7d-4c1e-9f0a-1b2c3d4e5f60' })
  @IsUUID()
  requestId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  stars: number;
}

export class RatingDto {
  @ApiProperty({
    example: '9b1e4c2a-7d60-4f83-a1b2-5c6d7e8f9012',
    description: 'Identificador de la calificación',
  })
  id: string;

  @ApiProperty({
    example: '3f1c2a9e-8b7d-4c1e-9f0a-1b2c3d4e5f60',
    description: 'Solicitud de ayuda que se califica',
  })
  requestId: string;

  @ApiProperty({
    example: 'c4d5e6f7-8091-4a2b-8c3d-4e5f60718293',
    description: 'Ayudante que aceptó la solicitud',
  })
  helperId: string;

  @ApiProperty({
    example: 5,
    description: 'Calificación de 1 a 5',
  })
  stars: number;

  @ApiProperty({
    example: '2026-11-21T17:12:27.000Z',
    description: 'Fecha en que se registró la calificación',
  })
  createdAt: Date;
}
