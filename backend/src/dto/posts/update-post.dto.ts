import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsArray,
  IsUUID,
} from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Текст поста обязателен' })
  @MaxLength(5000, { message: 'Текст поста не должен превышать 5000 символов' })
  content?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  removeImageIds?: string[];
}
