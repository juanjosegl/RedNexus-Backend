import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, type JwtPayload } from '../auth/auth.decorators.js';
import { CreateRatingDto, RatingDto } from './dto/rating.dto.js';
import { ReceivedRatingDto } from './dto/received-rating.dto.js';
import { RatingsService } from './ratings.service.js';

@ApiTags('ratings')
@ApiBearerAuth()
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratings: RatingsService) {}

  @Post()
  @ApiOperation({ summary: 'Califica de 1 a 5 la ayuda recibida' })
  @ApiCreatedResponse({ type: RatingDto })
  @ApiForbiddenResponse({ description: 'La solicitud es de otro usuario' })
  @ApiConflictResponse({
    description: 'La solicitud no fue aceptada o ya tiene calificacion',
  })
  rate(@CurrentUser() user: JwtPayload, @Body() dto: CreateRatingDto) {
    return this.ratings.rate(user.sub, dto);
  }

  @Get('received')
  @ApiOperation({
    summary: 'Lista las calificaciones que recibí como ayudante',
  })
  @ApiOkResponse({ type: [ReceivedRatingDto] })
  received(@CurrentUser() user: JwtPayload) {
    return this.ratings.received(user.sub);
  }
}
