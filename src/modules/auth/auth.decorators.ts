import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';

// Contenido del JWT. `sub` es el id del usuario.
export interface JwtPayload {
  sub: string;
  email: string;
}

// Todas las rutas exigen sesión (JwtAuthGuard global); @Public() la quita.
export const IS_PUBLIC = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC, true);

// Usuario autenticado de la petición: @CurrentUser() user: JwtPayload
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload =>
    ctx.switchToHttp().getRequest().user,
);
