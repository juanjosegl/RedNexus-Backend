import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'nuevo.demo@rednexus.dev' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(120)
  email: string;

  @ApiProperty({ example: 'demo12345', minLength: 8 })
  @IsString()
  @Length(8, 72) // bcrypt solo usa los primeros 72 bytes
  password: string;

  @ApiProperty({ example: 'Nuevo Estudiante' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(2, 80)
  name: string;
}
