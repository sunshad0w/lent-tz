import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(1, { message: 'Текст поста обязателен' })
  @MaxLength(5000, { message: 'Текст поста не должен превышать 5000 символов' })
  content: string;
}
