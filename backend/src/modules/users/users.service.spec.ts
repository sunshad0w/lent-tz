import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from 'src/entities';
import { UpdateProfileDto } from 'src/dto/users';

type MockRepository<T extends object = object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <T extends object>(): MockRepository<T> => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-uuid-123',
  email: 'test@example.com',
  password: 'hashed-password',
  firstName: 'Иван',
  lastName: 'Иванов',
  birthDate: '1990-01-01',
  about: 'Описание профиля',
  phone: '+79991234567',
  avatarPath: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  posts: [],
  refreshTokens: [],
  ...overrides,
});

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: MockRepository<User>;

  beforeEach(async () => {
    usersRepository = createMockRepository<User>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('должен вернуть пользователя по валидному userId', async () => {
      const mockUser = createMockUser();
      usersRepository.findOne?.mockResolvedValue(mockUser);

      const result = await service.getProfile('test-uuid-123');

      expect(result).toEqual(mockUser);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-uuid-123' },
      });
    });

    it('должен выбросить NotFoundException для несуществующего userId', async () => {
      usersRepository.findOne?.mockResolvedValue(null);

      await expect(service.getProfile('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });
  });

  describe('updateProfile', () => {
    it('должен обновить поля пользователя из DTO', async () => {
      const mockUser = createMockUser();
      const dto: UpdateProfileDto = {
        firstName: 'Пётр',
        lastName: 'Петров',
      };
      const updatedUser = createMockUser({ ...dto });

      usersRepository.findOne?.mockResolvedValue(mockUser);
      usersRepository.save?.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('test-uuid-123', dto);

      expect(result).toEqual(updatedUser);
      expect(usersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Пётр',
          lastName: 'Петров',
        }),
      );
    });

    it('должен вернуть обновлённого пользователя', async () => {
      const mockUser = createMockUser();
      const dto: UpdateProfileDto = { about: 'Новое описание' };
      const updatedUser = createMockUser({ about: 'Новое описание' });

      usersRepository.findOne?.mockResolvedValue(mockUser);
      usersRepository.save?.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('test-uuid-123', dto);

      expect(result.about).toBe('Новое описание');
    });

    it('должен выбросить NotFoundException, если пользователь не найден', async () => {
      usersRepository.findOne?.mockResolvedValue(null);

      const dto: UpdateProfileDto = { firstName: 'Пётр' };

      await expect(
        service.updateProfile('non-existent-id', dto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateAvatar', () => {
    it('должен обновить avatarPath', async () => {
      const mockUser = createMockUser();
      const avatarPath = '/uploads/avatars/new-avatar.jpg';
      const updatedUser = createMockUser({ avatarPath });

      usersRepository.findOne?.mockResolvedValue(mockUser);
      usersRepository.save?.mockResolvedValue(updatedUser);

      const result = await service.updateAvatar('test-uuid-123', avatarPath);

      expect(result.avatarPath).toBe(avatarPath);
      expect(usersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ avatarPath }),
      );
    });

    it('должен вернуть обновлённого пользователя', async () => {
      const mockUser = createMockUser();
      const avatarPath = '/uploads/avatars/avatar.png';
      const updatedUser = createMockUser({ avatarPath });

      usersRepository.findOne?.mockResolvedValue(mockUser);
      usersRepository.save?.mockResolvedValue(updatedUser);

      const result = await service.updateAvatar('test-uuid-123', avatarPath);

      expect(result).toEqual(updatedUser);
    });

    it('должен выбросить NotFoundException, если пользователь не найден', async () => {
      usersRepository.findOne?.mockResolvedValue(null);

      await expect(
        service.updateAvatar('non-existent-id', '/uploads/avatar.jpg'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
