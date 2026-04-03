import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { User, RefreshToken } from 'src/entities';
import { RegisterDto, LoginDto } from 'src/dto/auth';
import type { JwtPayload } from './strategies/jwt.strategy';
import type { Response } from 'express';

const COOKIE_PATH = '/api/auth';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto, res: Response) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
    await this.usersRepository.save(user);

    const accessToken = this.generateAccessToken(user);
    await this.setRefreshTokenCookie(user.id, res);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
      select: ['id', 'email', 'password', 'firstName', 'lastName'],
    });
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const accessToken = this.generateAccessToken(user);
    await this.setRefreshTokenCookie(user.id, res);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async refresh(
    refreshTokenValue: string,
    accessToken: string | undefined,
    res: Response,
  ) {
    if (!refreshTokenValue) {
      throw new UnauthorizedException('Refresh-токен отсутствует');
    }

    const userId = this.extractUserIdFromExpiredToken(accessToken);

    if (!userId) {
      throw new UnauthorizedException('Невалидный access-токен');
    }

    const records = await this.refreshTokenRepository.find({
      where: { userId },
      relations: ['user'],
    });

    let matchedToken: RefreshToken | null = null;
    for (const record of records) {
      if (record.expiresAt <= new Date()) {
        continue;
      }
      const isMatch = await bcrypt.compare(refreshTokenValue, record.tokenHash);
      if (isMatch) {
        matchedToken = record;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Невалидный или истёкший refresh-токен');
    }

    await this.refreshTokenRepository.remove(matchedToken);

    const user = matchedToken.user;
    const newAccessToken = this.generateAccessToken(user);
    await this.setRefreshTokenCookie(user.id, res);

    return { accessToken: newAccessToken };
  }

  async logout(
    refreshTokenValue: string,
    userId: string | undefined,
    res: Response,
  ) {
    if (refreshTokenValue && userId) {
      const records = await this.refreshTokenRepository.find({
        where: { userId },
      });

      for (const record of records) {
        const isMatch = await bcrypt.compare(
          refreshTokenValue,
          record.tokenHash,
        );
        if (isMatch) {
          await this.refreshTokenRepository.remove(record);
          break;
        }
      }
    }

    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'strict',
      path: COOKIE_PATH,
    });

    return {};
  }

  private generateAccessToken(user: Pick<User, 'id' | 'email'>): string {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  private extractUserIdFromExpiredToken(
    accessToken: string | undefined,
  ): string | undefined {
    if (!accessToken) return undefined;
    try {
      const payload = this.jwtService.verify<JwtPayload>(accessToken, {
        ignoreExpiration: true,
      });
      return payload.sub;
    } catch {
      return undefined;
    }
  }

  private async setRefreshTokenCookie(
    userId: string,
    res: Response,
  ): Promise<void> {
    const rawToken = uuid();
    const tokenHash = await bcrypt.hash(rawToken, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({ tokenHash, userId, expiresAt }),
    );

    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    res.cookie('refresh_token', rawToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: COOKIE_PATH,
    });
  }
}
