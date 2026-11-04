import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dto/user.dto.js';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT para el encabezado Authorization: Bearer <token>',
  })
  accessToken: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}
