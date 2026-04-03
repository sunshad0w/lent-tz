import { BadRequestException } from '@nestjs/common';
import { extname } from 'node:path';
import { v4 as uuid } from 'uuid';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 МБ

export const imageFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return callback(
      new BadRequestException(
        `Неподдерживаемый формат файла. Допустимые: ${ALLOWED_MIME_TYPES.join(', ')}`,
      ),
      false,
    );
  }
  callback(null, true);
};

export const generateFileName = (file: Express.Multer.File): string => {
  return `${uuid()}${extname(file.originalname)}`;
};

export const UPLOAD_LIMITS = {
  fileSize: MAX_FILE_SIZE,
};

export const AVATAR_STORAGE_PATH = './uploads/avatars';
export const POST_STORAGE_PATH = './uploads/posts';
