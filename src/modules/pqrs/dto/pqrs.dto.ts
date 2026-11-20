import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Length } from 'class-validator';
import { PqrsStatus, PqrsType } from '../../../generated/prisma/enums.js';

export class CreatePqrsDto {
  @ApiProperty({ enum: PqrsType, example: PqrsType.PETICION })
  @IsEnum(PqrsType)
  type: PqrsType;

  @ApiProperty({
    example: 'No me llegan candidatos',
    minLength: 5,
    maxLength: 120,
  })
  @IsString()
  @Length(5, 120)
  subject: string;

  @ApiProperty({
    example:
      'Publiqué una solicitud de ayuda hace dos días y sigue en estado Pendiente.',
    minLength: 20,
    maxLength: 2000,
  })
  @IsString()
  @Length(20, 2000)
  description: string;
}

export class PqrsDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    example: 'PQRS-000001',
    description: 'Número de radicado para hacer seguimiento',
  })
  radicado: string;

  @ApiProperty({ enum: PqrsType })
  type: PqrsType;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: PqrsStatus, example: PqrsStatus.RADICADA })
  status: PqrsStatus;

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'Respuesta del equipo',
  })
  response: string | null;

  @ApiProperty({ nullable: true, type: Date })
  respondedAt: Date | null;

  @ApiProperty()
  createdAt: Date;
}
