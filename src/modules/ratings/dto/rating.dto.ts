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
  @ApiProperty()
  id: string;

  @ApiProperty()
  requestId: string;

  @ApiProperty({ description: 'Ayudante que acepto la solicitud' })
  helperId: string;

  @ApiProperty({ example: 5 })
  stars: number;

  @ApiProperty()
  createdAt: Date;
}
