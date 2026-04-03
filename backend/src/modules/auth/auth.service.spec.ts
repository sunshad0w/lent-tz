import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User, RefreshToken } from 'src/entities';
import type { RegisterDto, LoginDto } from 'src/dto/auth';
import type { Response } from 'express';

jest.mock('uuid', () => ({ v4: () => 'mocked-uuid-token' }));

type MockRepository<T extends object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <T extends object>(): MockRepository<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const createMockResponse = (): {
  res: Response;
  cookieFn: jest.Mock;
  clearCookieFn: jest.Mock;
} => {
  const cookieFn = jest.fn();
  const clearCookieFn = jest.fn();
  const res = {
    cookie: cookieFn,
    clearCookie: clearCookieFn,
  } as unknown as Response;
  return { res, cookieFn, clearCookieFn };
};

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: MockRepository<User>;
  let refreshTokenRepository: MockRepository<RefreshToken>;
  let jwtService: { sign: jest.Mock; verify: jest.Mock };

  const mockUser: User = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    password: '$2b$10$hashedPassword',
    firstName: 'Иван',
    lastName: 'Иванов',
    birthDate: null,
    about: null,
    phone: null,
    avatarPath: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    posts: [],
    refreshTokens: [],
  };

  const registerDto: RegisterDto = {
    email: 'test@example.com',
    password: 'securePassword123',
    firstName: 'Иван',
    lastName: 'Иванов',
  };

  const loginDto: LoginDto = {
    email: 'test@example.com',
    password: 'securePassword123',
  };

  beforeEach(async () => {
    usersRepository = createMockRepository<User>();
    refreshTokenRepository = createMockRepository<RefreshToken>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: refreshTokenRepository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-access-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('development'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);

    // Общие моки для setRefreshTokenCookie
    refreshTokenRepository.create!.mockImplementation(
      (data: Partial<RefreshToken>) => data,
    );
    refreshTokenRepository.save!.mockResolvedValue({} as RefreshToken);
  });

  describe('register', () => {
    it('создаёт пользователя с захешированным паролем', async () => {
      const { res } = createMockResponse();
      usersRepository.findOne!.mockResolvedValue(null);
      usersRepository.create!.mockReturnValue(mockUser);
      usersRepository.save!.mockResolvedValue(mockUser);

      await service.register(registerDto, res);

      expect(usersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
        }),
      );

      // Пароль должен быть захеширован, а не передан в чистом виде
      const createArgs = usersRepository.create!.mock.calls[0] as [
        { password: string },
      ];
      expect(createArgs[0].password).not.toBe(registerDto.password);
      expect(createArgs[0].password.startsWith('$2b$')).toBe(true);
    });

    it('возвращает accessToken и данные пользователя', async () => {
      const { res } = createMockResponse();
      usersRepository.findOne!.mockResolvedValue(null);
      usersRepository.create!.mockReturnValue(mockUser);
      usersRepository.save!.mockResolvedValue(mockUser);

      const result = await service.register(registerDto, res);

      expect(result).toEqual({
        accessToken: 'mocked-access-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        },
      });
    });

    it('выбрасывает ConflictException, если email уже занят', async () => {
      const { res } = createMockResponse();
      usersRepository.findOne!.mockResolvedValue(mockUser);

      await expect(service.register(registerDto, res)).rejects.toThrow(
        ConflictException,
      );
    });

    it('устанавливает cookie с refresh-токеном', async () => {
      const { res, cookieFn } = createMockResponse();
      usersRepository.findOne!.mockResolvedValue(null);
      usersRepository.create!.mockReturnValue(mockUser);
      usersRepository.save!.mockResolvedValue(mockUser);

      await service.register(registerDto, res);

      expect(cookieFn).toHaveBeenCalledWith(
        'refresh_token',
        'mocked-uuid-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/api/auth',
        }),
      );
    });
  });

  describe('login', () => {
    it('возвращает accessToken при валидных учётных данных', async () => {
      const { res } = createMockResponse();
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const userWithHash = { ...mockUser, password: hashedPassword };

      usersRepository.findOne!.mockResolvedValue(userWithHash);

      const result = await service.login(loginDto, res);

      expect(result).toEqual({
        accessToken: 'mocked-access-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        },
      });
    });

    it('выбрасывает UnauthorizedException при неверном пароле', async () => {
      const { res } = createMockResponse();
      const hashedPassword = await bcrypt.hash('otherPassword123', 10);
      const userWithHash = { ...mockUser, password: hashedPassword };

      usersRepository.findOne!.mockResolvedValue(userWithHash);

      await expect(service.login(loginDto, res)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('выбрасывает UnauthorizedException при несуществующем email', async () => {
      const { res } = createMockResponse();
      usersRepository.findOne!.mockResolvedValue(null);

      await expect(service.login(loginDto, res)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    const rawRefreshToken = 'raw-refresh-token-value';

    it('возвращает новый accessToken при валидном refresh-токене', async () => {
      const { res } = createMockResponse();
      const tokenHash = await bcrypt.hash(rawRefreshToken, 10);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const storedToken: Partial<RefreshToken> = {
        id: 'token-id',
        tokenHash,
        userId: mockUser.id,
        expiresAt: futureDate,
        user: mockUser,
      };

      jwtService.verify.mockReturnValue({
        sub: mockUser.id,
        email: mockUser.email,
      });
      refreshTokenRepository.find!.mockResolvedValue([storedToken]);
      refreshTokenRepository.remove!.mockResolvedValue(storedToken);

      const result = await service.refresh(
        rawRefreshToken,
        'expired-access-token',
        res,
      );

      expect(result).toEqual({ accessToken: 'mocked-access-token' });
    });

    it('ротирует refresh-токен: удаляет старый и создаёт новый', async () => {
      const { res, cookieFn } = createMockResponse();
      const tokenHash = await bcrypt.hash(rawRefreshToken, 10);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const storedToken: Partial<RefreshToken> = {
        id: 'token-id',
        tokenHash,
        userId: mockUser.id,
        expiresAt: futureDate,
        user: mockUser,
      };

      jwtService.verify.mockReturnValue({
        sub: mockUser.id,
        email: mockUser.email,
      });
      refreshTokenRepository.find!.mockResolvedValue([storedToken]);
      refreshTokenRepository.remove!.mockResolvedValue(storedToken);

      await service.refresh(rawRefreshToken, 'expired-access-token', res);

      // Старый токен должен быть удалён
      expect(refreshTokenRepository.remove).toHaveBeenCalledWith(storedToken);

      // Новый refresh-токен должен быть сохранён и установлен в cookie
      expect(refreshTokenRepository.save).toHaveBeenCalled();
      expect(cookieFn).toHaveBeenCalledWith(
        'refresh_token',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          path: '/api/auth',
        }),
      );
    });

    it('выбрасывает UnauthorizedException при невалидном токене', async () => {
      const { res } = createMockResponse();

      jwtService.verify.mockReturnValue({
        sub: mockUser.id,
        email: mockUser.email,
      });
      refreshTokenRepository.find!.mockResolvedValue([]);

      await expect(
        service.refresh(rawRefreshToken, 'expired-access-token', res),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('выбрасывает UnauthorizedException при истёкшем refresh-токене', async () => {
      const { res } = createMockResponse();
      const tokenHash = await bcrypt.hash(rawRefreshToken, 10);
      const pastDate = new Date('2020-01-01');

      const expiredToken: Partial<RefreshToken> = {
        id: 'token-id',
        tokenHash,
        userId: mockUser.id,
        expiresAt: pastDate,
        user: mockUser,
      };

      jwtService.verify.mockReturnValue({
        sub: mockUser.id,
        email: mockUser.email,
      });
      refreshTokenRepository.find!.mockResolvedValue([expiredToken]);

      await expect(
        service.refresh(rawRefreshToken, 'expired-access-token', res),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('выбрасывает UnauthorizedException при отсутствующем refresh-токене', async () => {
      const { res } = createMockResponse();

      await expect(service.refresh('', undefined, res)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('удаляет refresh-токен из БД', async () => {
      const { res } = createMockResponse();
      const rawToken = 'raw-refresh-token';
      const tokenHash = await bcrypt.hash(rawToken, 10);

      const storedToken: Partial<RefreshToken> = {
        id: 'token-id',
        tokenHash,
        userId: mockUser.id,
      };

      refreshTokenRepository.find!.mockResolvedValue([storedToken]);
      refreshTokenRepository.remove!.mockResolvedValue(storedToken);

      await service.logout(rawToken, mockUser.id, res);

      expect(refreshTokenRepository.remove).toHaveBeenCalledWith(storedToken);
    });

    it('очищает cookie с правильным path', async () => {
      const { res, clearCookieFn } = createMockResponse();

      refreshTokenRepository.find!.mockResolvedValue([]);

      await service.logout('some-token', mockUser.id, res);

      expect(clearCookieFn).toHaveBeenCalledWith(
        'refresh_token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/api/auth',
        }),
      );
    });
  });
});
