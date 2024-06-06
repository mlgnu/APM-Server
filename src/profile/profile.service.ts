import {
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
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
import { Student } from 'src/typeorm/Student';
import { Advisor } from 'src/typeorm/Advisor';
import { AuthenticationService } from 'src/authentication/authentication.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Advisor)
    private readonly advisorRepo: Repository<Advisor>,
    private readonly authService: AuthenticationService,
  ) {}

  async getUserProfile(id: number, role: number) {
    if (role == 0) {
      return await this.authService.findStudentByUserId(id);
    } else if (role == 1) {
      return await this.authService.findAdvisorByUserId(id);
    }
  }

  async getUserById(id: number) {
    this.userRepo.createQueryBuilder('');
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

  async updateUser(modUser: UpdateUserDto, id: number, role: number) {
    console.log(role, 'from update user');
    if (role == 0) {
      const student = await this.authService.findStudentByUserId(id);
      student.firstName = modUser.firstName;
      student.lastName = modUser.lastName;
      student.department = modUser.department;
      return await this.studentRepo.save(student);
    } else if (role == 1) {
      const advisor = await this.authService.findAdvisorByUserId(id);
      advisor.firstName = modUser.firstName;
      advisor.lastName = modUser.lastName;
      advisor.department = modUser.department;
      return await this.advisorRepo.save(advisor);
    }
  }
ٌ}
