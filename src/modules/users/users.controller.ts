import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, type JwtPayload } from '../auth/auth.decorators.js';
import { ProfileDto, PublicProfileDto } from './dto/profile.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Mi perfil con mi calificación promedio' })
  @ApiOkResponse({ type: ProfileDto })
  me(@CurrentUser() user: JwtPayload) {
    return this.users.me(user.sub);
  }

  @Patch('me')
  @ApiOperation({
    summary:
      'Edita mi perfil; si cambian bio o etiquetas, la IA lo vuelve a indexar',
  })
  @ApiOkResponse({ type: ProfileDto })
  update(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.users.update(user.sub, dto);
  }

  @Get('me/export')
  @ApiOperation({
    summary:
      'Descarga todos mis datos en JSON (derecho de acceso, Ley 1581 art. 8)',
  })
  @ApiOkResponse({
    description: 'Perfil, solicitudes, candidaturas, calificaciones y PQRS',
  })
  exportData(@CurrentUser() user: JwtPayload) {
    return this.users.exportData(user.sub);
  }

  @Delete('me')
  @HttpCode(204)
  @ApiOperation({
    summary:
      'Elimina mi cuenta y todo lo asociado (derecho de supresión, Ley 1581 art. 8)',
  })
  @ApiNoContentResponse()
  deleteAccount(@CurrentUser() user: JwtPayload) {
    return this.users.deleteAccount(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Perfil público de otro usuario (sin email)' })
  @ApiOkResponse({ type: PublicProfileDto })
  @ApiNotFoundResponse()
  publicProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.publicProfile(id);
  }
}
