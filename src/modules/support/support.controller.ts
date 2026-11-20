import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SupportChatDto, SupportReplyDto } from './dto/support-chat.dto.js';
import { SupportService } from './support.service.js';

// Las respuestas de error (400, 401, 503) se documentan en BE-11
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
  chat(@Body() dto: SupportChatDto) {
    return this.support.chat(dto);
  }
}
