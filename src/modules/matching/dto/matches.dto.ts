import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStatus, RequestStatus } from '../../../generated/prisma/enums.js';

export class IncomingAuthorDto {
  @ApiProperty({ example: 'Estudiante Demo' })
  name: string;
}

export class IncomingRequestDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'No entiendo los joins en SQL' })
  text: string;

  @ApiPropertyOptional({ example: 'bases-de-datos' })
  area: string | null;

  @ApiProperty({ example: ['joins', 'sql'] })
  topics: string[];

  @ApiPropertyOptional({ example: 'basico' })
  level: string | null;

  @ApiProperty({ enum: RequestStatus })
  status: RequestStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: IncomingAuthorDto })
  author: IncomingAuthorDto;
}

export class IncomingMatchDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 0.59 })
  score: number;

  @ApiPropertyOptional({
    example: 'Ana encaja porque su perfil menciona: sql, joins.',
  })
  explanation: string | null;

  @ApiProperty({ enum: MatchStatus })
  status: MatchStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: IncomingRequestDto })
  request: IncomingRequestDto;
}

export class AcceptMatchDto {
  @ApiProperty({ example: 'estudiante.demo@rednexus.dev' })
  authorEmail: string;
}

export class RejectMatchDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: MatchStatus, example: MatchStatus.REJECTED })
  status: MatchStatus;
}
