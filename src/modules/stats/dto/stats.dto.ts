import { ApiProperty } from '@nestjs/swagger';

export class RequestsByAreaDto {
  @ApiProperty({
    example: 'bases-de-datos',
    description: 'Área de las solicitudes',
  })
  area: string;

  @ApiProperty({
    example: 30,
    description: 'Solicitudes en esa área',
  })
  count: number;
}

export class StatsDto {
  @ApiProperty({ example: 52, description: 'Personas en la red' })
  users: number;

  @ApiProperty({ example: 130, description: 'Solicitudes de ayuda' })
  helpRequests: number;

  @ApiProperty({
    example: 92.3,
    description: 'Porcentaje de solicitudes que ya tienen candidatos o ayuda',
  })
  matchedPercent: number;

  @ApiProperty({
    example: 41,
    description: 'Solicitudes que alguien ya aceptó',
  })
  acceptedHelps: number;

  @ApiProperty({
    example: 4.6,
    nullable: true,
    description: 'Promedio de las calificaciones',
  })
  averageRating: number | null;

  @ApiProperty({
    type: [RequestsByAreaDto],
    example: [{ area: 'bases-de-datos', count: 30 }],
    description: 'Las cinco áreas con más solicitudes',
  })
  requestsByArea: RequestsByAreaDto[];
}
