import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SupportChatDto, SupportReplyDto } from './dto/support-chat.dto.js';
import { SupportService } from './support.service.js';

@ApiTags('support')
@ApiBearerAuth()
@Controller('support')
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Post('chat')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Pregunta al asistente de soporte de RedNexus (RAG)',
  })
  @ApiOkResponse({ type: SupportReplyDto })
  @ApiBadRequestResponse({
    description:
      'Mensaje de menos de 2 o más de 1000 caracteres, rol inválido en el historial o más de 10 turnos',
  })
  @ApiUnauthorizedResponse({ description: 'Sin token o token inválido' })
  @ApiServiceUnavailableResponse({
    description:
      'El asistente no respondió a tiempo o no está disponible; el cuerpo trae un mensaje para mostrar',
  })
  chat(@Body() dto: SupportChatDto) {
    return this.support.chat(dto);
  }
}
