import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostImage } from 'src/entities';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(PostImage)
    private readonly postImagesRepository: Repository<PostImage>,
  ) {}

  async findAll(
    userId: string,
    query: { offset?: number; limit?: number; sort?: 'asc' | 'desc' },
  ) {
    const offset = query.offset ?? 0;
    const limit = query.limit ?? 10;
    const sort = query.sort ?? 'desc';

    const [data, total] = await this.postsRepository.findAndCount({
      where: { userId },
      order: { createdAt: sort === 'asc' ? 'ASC' : 'DESC' },
      skip: offset,
      take: limit,
      relations: ['images'],
    });

    return {
      data: data.map((post) => ({
        id: post.id,
        content: post.content,
        images: post.images
          .toSorted((a, b) => a.order - b.order)
          .map((img) => ({
            id: img.id,
            url: `/uploads/posts/${img.filePath.split('/').pop()}`,
            order: img.order,
          })),
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })),
      total,
      limit,
      offset,
    };
  }

  async create(
    userId: string,
    content: string,
    files: Express.Multer.File[],
  ): Promise<Post> {
    const post = this.postsRepository.create({ content, userId });
    const savedPost = await this.postsRepository.save(post);

    if (files && files.length > 0) {
      const images = files.map((file, index) =>
        this.postImagesRepository.create({
          filePath: file.path,
          order: index,
          postId: savedPost.id,
        }),
      );
      await this.postImagesRepository.save(images);
    }

    return this.postsRepository.findOne({
      where: { id: savedPost.id },
      relations: ['images'],
    }) as Promise<Post>;
  }

  async update(
    userId: string,
    postId: string,
    dto: { content?: string; removeImageIds?: string[] },
    files: Express.Multer.File[],
  ): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id: postId, userId },
      relations: ['images'],
    });
    if (!post) {
      throw new NotFoundException('Пост не найден');
    }

    if (dto.content !== undefined) {
      post.content = dto.content;
    }
    await this.postsRepository.save(post);

    if (dto.removeImageIds && dto.removeImageIds.length > 0) {
      await this.postImagesRepository.delete(
        dto.removeImageIds.map((id) => ({ id, postId })),
      );
    }

    if (files && files.length > 0) {
      const currentMaxOrder =
        post.images.length > 0
          ? Math.max(...post.images.map((img) => img.order))
          : -1;
      const newImages = files.map((file, index) =>
        this.postImagesRepository.create({
          filePath: file.path,
          order: currentMaxOrder + 1 + index,
          postId,
        }),
      );
      await this.postImagesRepository.save(newImages);
    }

    return this.postsRepository.findOne({
      where: { id: postId },
      relations: ['images'],
    }) as Promise<Post>;
  }

  async softRemove(userId: string, postId: string): Promise<void> {
    const post = await this.postsRepository.findOne({
      where: { id: postId, userId },
    });
    if (!post) {
      throw new NotFoundException('Пост не найден');
    }
    await this.postsRepository.softDelete(postId);
  }
}
