import { ApiProperty } from '@nestjs/swagger';

export class ReceivedRatingRequestDto {
  @ApiProperty({
    example: '3f1c2a9e-8b7d-4c1e-9f0a-1b2c3d4e5f60',
  })
  requestId: string;

  @ApiProperty({
    example: 'No entiendo los joins en SQL',
    maxLength: 120,
  })
  text: string;

  @ApiProperty({
    example: 'bases-de-datos',
    nullable: true,
  })
  area: string | null;
}

export class ReceivedRatingDto {
  @ApiProperty({ example: 5 })
  stars: number;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: ReceivedRatingRequestDto })
  request: ReceivedRatingRequestDto;
}
