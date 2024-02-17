import {
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/authentication/dtos/CreateUserDto';
import { User } from 'src/typeorm';
import { PrimaryGeneratedColumn, Repository } from 'typeorm';
import { UpdateUserDto } from './dtos/UpdateUserDto';
import { log } from 'console';
import { GoogleAuthGuard } from 'src/authentication/utils/Guards';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getUserById(id: number) {
    this.userRepo.createQueryBuilder('')
    const user = await this.userRepo.findOneBy({ id: id });
    return (
      user ??
      (() => {
        throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
      })()
    );
  }

  
  async getCurrentUser(req) {
    console.log(req.user);
    console.log('From current user');
    return await this.getUserById(req.user.id);
  }

  async updateUser(modUser: UpdateUserDto) {
    const user = await this.getUserById(modUser.id);
    Object.assign(user, modUser);
    console.log(user);
    const saveUser = await this.userRepo.save(modUser);
    if (saveUser) return HttpStatus.CREATED;
    else return HttpStatus.INTERNAL_SERVER_ERROR;
    // return true;
    //    Object.assign()
  }
}
