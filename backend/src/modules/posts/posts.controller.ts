import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetPostsDto, CreatePostDto, UpdatePostDto } from 'src/dto/posts';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import {
  imageFileFilter,
  generateFileName,
  UPLOAD_LIMITS,
  POST_STORAGE_PATH,
} from 'src/common/utils/file-upload.utils';

interface RequestWithUser extends Request {
  user: JwtPayload;
}

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: GetPostsDto, @Req() req: RequestWithUser) {
    return this.postsService.findAll(req.user.sub, query);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: POST_STORAGE_PATH,
        filename: (_req, file, cb) => cb(null, generateFileName(file)),
      }),
      fileFilter: imageFileFilter,
      limits: UPLOAD_LIMITS,
    }),
  )
  async create(
    @Body() dto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: RequestWithUser,
  ) {
    const post = await this.postsService.create(
      req.user.sub,
      dto.content,
      files || [],
    );
    return {
      id: post.id,
      content: post.content,
      images: (post.images || [])
        .sort((a, b) => a.order - b.order)
        .map((img) => ({
          id: img.id,
          url: `/uploads/posts/${img.filePath.split('/').pop()}`,
          order: img.order,
        })),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: POST_STORAGE_PATH,
        filename: (_req, file, cb) => cb(null, generateFileName(file)),
      }),
      fileFilter: imageFileFilter,
      limits: UPLOAD_LIMITS,
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: RequestWithUser,
  ) {
    const post = await this.postsService.update(
      req.user.sub,
      id,
      dto,
      files || [],
    );
    return {
      id: post.id,
      content: post.content,
      images: (post.images || [])
        .sort((a, b) => a.order - b.order)
        .map((img) => ({
          id: img.id,
          url: `/uploads/posts/${img.filePath.split('/').pop()}`,
          order: img.order,
        })),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    await this.postsService.softRemove(req.user.sub, id);
    return {};
  }
}
