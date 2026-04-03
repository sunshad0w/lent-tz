import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { UpdateProfileDto } from 'src/dto/users';
import {
  imageFileFilter,
  generateFileName,
  UPLOAD_LIMITS,
  AVATAR_STORAGE_PATH,
} from 'src/common/utils/file-upload.utils';

interface RequestWithUser extends Request {
  user: JwtPayload;
}

@Controller('profile')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getProfile(@Req() req: RequestWithUser) {
    const user = await this.usersService.getProfile(req.user.sub);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: user.birthDate,
      about: user.about,
      phone: user.phone,
      avatarUrl: user.avatarPath
        ? `/uploads/avatars/${user.avatarPath.split('/').pop()}`
        : null,
      createdAt: user.createdAt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @Req() req: RequestWithUser,
  ) {
    const user = await this.usersService.updateProfile(req.user.sub, dto);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: user.birthDate,
      about: user.about,
      phone: user.phone,
      avatarUrl: user.avatarPath
        ? `/uploads/avatars/${user.avatarPath.split('/').pop()}`
        : null,
      createdAt: user.createdAt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: AVATAR_STORAGE_PATH,
        filename: (_req, file, cb) => cb(null, generateFileName(file)),
      }),
      fileFilter: imageFileFilter,
      limits: UPLOAD_LIMITS,
    }),
  )
  async updateAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    if (!file) {
      throw new BadRequestException('Файл обязателен');
    }
    await this.usersService.updateAvatar(req.user.sub, file.path);
    return {
      avatarUrl: `/uploads/avatars/${file.filename}`,
    };
  }
}
