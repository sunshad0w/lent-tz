import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Имя должно быть не менее 2 символов' })
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Фамилия должна быть не менее 2 символов' })
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Дата должна быть в формате YYYY-MM-DD',
  })
  birthDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  about?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s\-()]{7,20}$/, {
    message: 'Некорректный формат телефона',
  })
  phone?: string;
}
