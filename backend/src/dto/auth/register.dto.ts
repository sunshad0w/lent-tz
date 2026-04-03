import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Пароль должен быть не менее 8 символов' })
  @MaxLength(128)
  password: string;

  @IsString()
  @MinLength(2, { message: 'Имя должно быть не менее 2 символов' })
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'Фамилия должна быть не менее 2 символов' })
  @MaxLength(100)
  lastName: string;
}
