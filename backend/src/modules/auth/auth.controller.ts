import { Controller, Post, Body, Res, Req, HttpCode } from '@nestjs/common';
import type { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from 'src/dto/auth';
import type { JwtPayload } from './strategies/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(dto, res);
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, res);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['refresh_token'] as string;
    const accessToken = (req.headers.authorization as string)?.replace(
      'Bearer ',
      '',
    );
    return this.authService.refresh(refreshToken, accessToken, res);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.['refresh_token'] as string;
    const accessToken = (req.headers.authorization as string)?.replace(
      'Bearer ',
      '',
    );
    const userId = this.extractUserId(accessToken);
    return this.authService.logout(refreshToken, userId, res);
  }

  private extractUserId(accessToken: string | undefined): string | undefined {
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
}
