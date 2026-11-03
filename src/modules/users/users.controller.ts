import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, type JwtPayload } from '../auth/auth.decorators.js';
import { ProfileDto } from './dto/profile.dto.js';
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
}
