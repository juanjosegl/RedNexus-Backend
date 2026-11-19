import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import type { ChatRole } from '../support-provider.js';

export class ChatTurnDto {
  @ApiProperty({ enum: ['user', 'assistant'], example: 'user' })
  @IsIn(['user', 'assistant'])
  role: ChatRole;

  @ApiProperty({ example: '¿Cómo creo una solicitud de ayuda?' })
  @IsString()
  @Length(1, 2000)
  content: string;
}

export class SupportChatDto {
  @ApiProperty({
    example: '¿Cómo funcionan las calificaciones?',
    minLength: 2,
    maxLength: 1000,
  })
  @IsString()
  @Length(2, 1000)
  message: string;

  @ApiPropertyOptional({
    type: [ChatTurnDto],
    description: 'Turnos anteriores de la conversación (máximo 10)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ChatTurnDto)
  history?: ChatTurnDto[];
}

export class SupportReplyDto {
  @ApiProperty({
    example:
      'Cuando una solicitud se cierra puedes calificar de 1 a 5 la ayuda recibida...',
  })
  answer: string;

  @ApiProperty({
    type: [String],
    example: ['calificaciones.md'],
    description: 'Documentos de la base de conocimiento usados',
  })
  sources: string[];

  @ApiProperty({ example: 'openwebui', enum: ['openwebui', 'mock'] })
  provider: string;

  @ApiProperty({ example: 2140, description: 'Tiempo de respuesta en ms' })
  latencyMs: number;
}
