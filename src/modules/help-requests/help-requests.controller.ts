import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnsupportedMediaTypeResponse,
} from '@nestjs/swagger';
import { CurrentUser, type JwtPayload } from '../auth/auth.decorators.js';
import {
  CreatedHelpRequestDto,
  CreateHelpRequestDto,
  HelpRequestDetailDto,
  HelpRequestSummaryDto,
} from './dto/help-request.dto.js';
import { MAX_AUDIO_BYTES } from '../ai/transcription.js';
import {
  HelpRequestsService,
  type UploadedAudio,
} from './help-requests.service.js';

@ApiTags('help-requests')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Falta el token o es inválido' })
@Controller('help-requests')
export class HelpRequestsController {
  constructor(private readonly helpRequests: HelpRequestsService) {}

  @Post()
  @ApiOperation({
    summary:
      'Publica una solicitud de ayuda; la IA busca candidatos en segundo plano',
  })
  @ApiCreatedResponse({ type: CreatedHelpRequestDto })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateHelpRequestDto) {
    return this.helpRequests.create(user.sub, dto);
  }

  @Post('voice')
  @ApiOperation({
    summary:
      'Publica una solicitud con una nota de voz; se transcribe y luego se buscan candidatos',
    description:
      'Formatos: webm, ogg, mp3, wav o m4a, hasta 10 MB (unos 60 s). La solicitud queda en PENDING con el texto "(nota de voz en transcripción)" hasta que el worker la transcribe. El audio no se guarda.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['audio'],
      properties: { audio: { type: 'string', format: 'binary' } },
    },
  })
  @ApiCreatedResponse({ type: CreatedHelpRequestDto })
  @ApiBadRequestResponse({ description: 'Falta el archivo de audio' })
  @ApiUnsupportedMediaTypeResponse({ description: 'El archivo no es audio' })
  @ApiPayloadTooLargeResponse({ description: 'Pesa más de 10 MB' })
  @UseInterceptors(
    FileInterceptor('audio', {
      limits: { fileSize: MAX_AUDIO_BYTES, files: 1 },
    }),
  )
  createFromVoice(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() audio: UploadedAudio | undefined,
  ) {
    return this.helpRequests.createFromVoice(user.sub, audio);
  }

  @Get('mine')
  @ApiOperation({
    summary: 'Mis solicitudes, de la más reciente a la más antigua',
  })
  @ApiOkResponse({ type: [HelpRequestSummaryDto] })
  findMine(@CurrentUser() user: JwtPayload) {
    return this.helpRequests.findMine(user.sub);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detalle con los candidatos y su explicación (solo el autor)',
  })
  @ApiOkResponse({ type: HelpRequestDetailDto })
  @ApiForbiddenResponse({ description: 'La solicitud es de otro usuario' })
  @ApiNotFoundResponse()
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.helpRequests.findOne(user.sub, id);
  }

  @Post(':id/close')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cierra la solicitud' })
  @ApiOkResponse({ type: HelpRequestSummaryDto })
  close(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.helpRequests.close(user.sub, id);
  }
}
