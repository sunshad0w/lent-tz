import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities';
import { UpdateProfileDto } from 'src/dto/users';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getProfile(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.getProfile(userId);
    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  async updateAvatar(userId: string, filePath: string): Promise<User> {
    const user = await this.getProfile(userId);
    user.avatarPath = filePath;
    return this.usersRepository.save(user);
  }
}
