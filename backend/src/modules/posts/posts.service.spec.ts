import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostsService } from './posts.service';
import { Post, PostImage } from 'src/entities';

const USER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const POST_ID = 'f0e1d2c3-b4a5-6789-0fed-cba987654321';
const IMAGE_ID_1 = '11111111-2222-3333-4444-555555555555';
const IMAGE_ID_2 = '66666666-7777-8888-9999-aaaaaaaaaaaa';

const NOW = new Date('2026-03-15T12:00:00.000Z');

function makeMockImage(overrides: Partial<PostImage> = {}): PostImage {
  return {
    id: IMAGE_ID_1,
    filePath: 'uploads/posts/photo1.jpg',
    order: 0,
    postId: POST_ID,
    createdAt: NOW,
    post: undefined as unknown as Post,
    ...overrides,
  };
}

function makeMockPost(overrides: Partial<Post> = {}): Post {
  return {
    id: POST_ID,
    content: 'Тестовый пост',
    userId: USER_ID,
    createdAt: NOW,
    updatedAt: NOW,
    deletedAt: null,
    user: undefined as unknown as import('../../entities').User,
    images: [
      makeMockImage({ id: IMAGE_ID_1, order: 0 }),
      makeMockImage({
        id: IMAGE_ID_2,
        filePath: 'uploads/posts/photo2.png',
        order: 1,
      }),
    ],
    ...overrides,
  };
}

function makeMockFile(filename: string): Express.Multer.File {
  return {
    fieldname: 'images',
    originalname: filename,
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    destination: 'uploads/posts',
    filename,
    path: `uploads/posts/${filename}`,
    buffer: Buffer.from(''),
    stream: undefined as never,
  };
}

type MockRepository<T extends import('typeorm').ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('PostsService', () => {
  let service: PostsService;
  let postsRepo: MockRepository<Post>;
  let postImagesRepo: MockRepository<PostImage>;

  beforeEach(async () => {
    postsRepo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
    };

    postImagesRepo = {
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(Post), useValue: postsRepo },
        { provide: getRepositoryToken(PostImage), useValue: postImagesRepo },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  // ─── findAll ────────────────────────────────────────────────

  describe('findAll', () => {
    it('возвращает пагинированные посты с изображениями', async () => {
      const post = makeMockPost();
      postsRepo.findAndCount!.mockResolvedValue([[post], 1]);

      const result = await service.findAll(USER_ID, {});

      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].images).toHaveLength(2);
      expect(result.data[0].images[0]).toEqual({
        id: IMAGE_ID_1,
        url: '/uploads/posts/photo1.jpg',
        order: 0,
      });
    });

    it('применяет сортировку ASC', async () => {
      postsRepo.findAndCount!.mockResolvedValue([[], 0]);

      await service.findAll(USER_ID, { sort: 'asc' });

      expect(postsRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { createdAt: 'ASC' },
        }),
      );
    });

    it('применяет сортировку DESC по умолчанию', async () => {
      postsRepo.findAndCount!.mockResolvedValue([[], 0]);

      await service.findAll(USER_ID, {});

      expect(postsRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { createdAt: 'DESC' },
        }),
      );
    });

    it('применяет offset и limit', async () => {
      postsRepo.findAndCount!.mockResolvedValue([[], 0]);

      await service.findAll(USER_ID, { offset: 5, limit: 20 });

      expect(postsRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 20,
        }),
      );
    });

    it('маппит изображения в формат URL', async () => {
      const post = makeMockPost({
        images: [
          makeMockImage({
            filePath: '/var/data/uploads/posts/abc123.jpg',
            order: 0,
          }),
        ],
      });
      postsRepo.findAndCount!.mockResolvedValue([[post], 1]);

      const result = await service.findAll(USER_ID, {});

      expect(result.data[0].images[0].url).toBe('/uploads/posts/abc123.jpg');
    });
  });

  // ─── create ─────────────────────────────────────────────────

  describe('create', () => {
    it('создаёт пост с контентом и userId', async () => {
      const savedPost = makeMockPost({ images: [] });
      const fullPost = makeMockPost();

      postsRepo.create!.mockReturnValue(savedPost);
      postsRepo.save!.mockResolvedValue(savedPost);
      postsRepo.findOne!.mockResolvedValue(fullPost);

      const result = await service.create(USER_ID, 'Тестовый пост', []);

      expect(postsRepo.create).toHaveBeenCalledWith({
        content: 'Тестовый пост',
        userId: USER_ID,
      });
      expect(result).toEqual(fullPost);
    });

    it('сохраняет изображения с правильным порядком', async () => {
      const savedPost = makeMockPost({ images: [] });
      const files = [makeMockFile('img1.jpg'), makeMockFile('img2.jpg')];

      postsRepo.create!.mockReturnValue(savedPost);
      postsRepo.save!.mockResolvedValue(savedPost);
      postsRepo.findOne!.mockResolvedValue(makeMockPost());
      postImagesRepo.create!.mockImplementation(
        (dto: Partial<PostImage>) => dto,
      );
      postImagesRepo.save!.mockResolvedValue([]);

      await service.create(USER_ID, 'Контент', files);

      expect(postImagesRepo.create).toHaveBeenCalledTimes(2);
      expect(postImagesRepo.create).toHaveBeenCalledWith({
        filePath: 'uploads/posts/img1.jpg',
        order: 0,
        postId: POST_ID,
      });
      expect(postImagesRepo.create).toHaveBeenCalledWith({
        filePath: 'uploads/posts/img2.jpg',
        order: 1,
        postId: POST_ID,
      });
    });

    it('возвращает пост с relations', async () => {
      const savedPost = makeMockPost({ images: [] });
      const fullPost = makeMockPost();

      postsRepo.create!.mockReturnValue(savedPost);
      postsRepo.save!.mockResolvedValue(savedPost);
      postsRepo.findOne!.mockResolvedValue(fullPost);

      await service.create(USER_ID, 'Контент', []);

      expect(postsRepo.findOne).toHaveBeenCalledWith({
        where: { id: POST_ID },
        relations: ['images'],
      });
    });

    it('работает без изображений (только текст)', async () => {
      const savedPost = makeMockPost({ images: [] });

      postsRepo.create!.mockReturnValue(savedPost);
      postsRepo.save!.mockResolvedValue(savedPost);
      postsRepo.findOne!.mockResolvedValue(savedPost);

      await service.create(USER_ID, 'Только текст', []);

      expect(postImagesRepo.create).not.toHaveBeenCalled();
      expect(postImagesRepo.save).not.toHaveBeenCalled();
    });
  });

  // ─── update ─────────────────────────────────────────────────

  describe('update', () => {
    it('обновляет контент поста', async () => {
      const post = makeMockPost();
      postsRepo.findOne!.mockResolvedValue(post);
      postsRepo.save!.mockResolvedValue({ ...post, content: 'Новый контент' });

      await service.update(USER_ID, POST_ID, { content: 'Новый контент' }, []);

      expect(postsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'Новый контент' }),
      );
    });

    it('добавляет новые изображения', async () => {
      const post = makeMockPost();
      const files = [makeMockFile('new-image.jpg')];

      postsRepo
        .findOne!.mockResolvedValueOnce(post)
        .mockResolvedValueOnce(post);
      postsRepo.save!.mockResolvedValue(post);
      postImagesRepo.create!.mockImplementation(
        (dto: Partial<PostImage>) => dto,
      );
      postImagesRepo.save!.mockResolvedValue([]);

      await service.update(USER_ID, POST_ID, {}, files);

      // currentMaxOrder = 1 (из двух изображений), новый order = 2
      expect(postImagesRepo.create).toHaveBeenCalledWith({
        filePath: 'uploads/posts/new-image.jpg',
        order: 2,
        postId: POST_ID,
      });
    });

    it('удаляет указанные изображения по ID', async () => {
      const post = makeMockPost();

      postsRepo
        .findOne!.mockResolvedValueOnce(post)
        .mockResolvedValueOnce(post);
      postsRepo.save!.mockResolvedValue(post);

      await service.update(
        USER_ID,
        POST_ID,
        { removeImageIds: [IMAGE_ID_1] },
        [],
      );

      expect(postImagesRepo.delete).toHaveBeenCalledWith([
        { id: IMAGE_ID_1, postId: POST_ID },
      ]);
    });

    it('выбрасывает NotFoundException для несуществующего поста', async () => {
      postsRepo.findOne!.mockResolvedValue(null);

      await expect(
        service.update(USER_ID, POST_ID, { content: 'Текст' }, []),
      ).rejects.toThrow(NotFoundException);
    });

    it('выбрасывает NotFoundException если userId не совпадает', async () => {
      postsRepo.findOne!.mockResolvedValue(null);

      const otherUserId = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff';
      await expect(
        service.update(otherUserId, POST_ID, { content: 'Текст' }, []),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── softRemove ─────────────────────────────────────────────

  describe('softRemove', () => {
    it('вызывает softDelete для поста', async () => {
      const post = makeMockPost();
      postsRepo.findOne!.mockResolvedValue(post);
      postsRepo.softDelete!.mockResolvedValue({ affected: 1 });

      await service.softRemove(USER_ID, POST_ID);

      expect(postsRepo.softDelete).toHaveBeenCalledWith(POST_ID);
    });

    it('выбрасывает NotFoundException для несуществующего поста', async () => {
      postsRepo.findOne!.mockResolvedValue(null);

      await expect(service.softRemove(USER_ID, POST_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('выбрасывает NotFoundException если userId не совпадает', async () => {
      postsRepo.findOne!.mockResolvedValue(null);

      const otherUserId = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff';
      await expect(service.softRemove(otherUserId, POST_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
