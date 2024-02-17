import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/CreateUserDto';
import { log } from 'console';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async validateUser(userDto: CreateUserDto) {
    console.log(userDto);

    const user = await this.userRepo.findOneBy({
      userEmail: userDto.userEmail,
    });
    if (user) return user;
    const newUser = this.userRepo.create({
      userEmail: userDto.userEmail,
      firstName: userDto.firstName,
      lastName: userDto.lastName,
    });
    this.userRepo.save(newUser);
    log('created!');
  }

  async findUser(userid: number) {
    const user = await this.userRepo.findOneBy({ id: userid });
    return user;
  }
}
