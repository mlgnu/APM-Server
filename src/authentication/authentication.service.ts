import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/CreateUserDto';
import { log } from 'console';
import { Student } from 'src/typeorm/Student';
import { Advisor } from 'src/typeorm/Advisor';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Advisor)
    private readonly advisorRepo: Repository<Advisor>,
  ) {}

  async validateUser(userDto: CreateUserDto) {
    const mappedUserEmail = {
      'mohamedtahahelmy@gmail.com': 'mumtaz@um.edu.my',
      'mohamedtahah2002@gmail.com': 'hafiezah@um.edy.my',
      'mohamed.t.h.s.a.2002@gmail.com': 'tdid_fsktm@um.edu.my',
      'qll.kirito.llp@gmail.com': 'tdid_fsktm@um.edu.my',
    };
    if (mappedUserEmail[userDto.userEmail]) {
      userDto.userEmail = mappedUserEmail[userDto.userEmail];
    }

    console.log(userDto, 'dto after mapping');

    let user = await this.userRepo.findOneBy({
      userEmail: userDto.userEmail,
    });

    if (!user) {
      const newUser = this.userRepo.create({
        userEmail: userDto.userEmail,
      });
      user = await this.userRepo.save(newUser);

      // const student = this.studentRepo.create({
      //   user: user,
      //   firstName: userDto.firstName,
      //   lastName: userDto.lastName,
      // });
      // await this.studentRepo.save(student);
    }

    if (user) return user;
    log('created!');
  }

  async findUser(userid: number) {
    const user = await this.userRepo.findOneBy({ id: userid });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async findStudentByUserId(
    userId: number,
    relations?: FindOptionsRelations<Student>,
  ) {
    const user = await this.findUser(userId);
    const student = await this.studentRepo.findOne({
      where: { user: user },
      relations: relations,
    });
    if (!student) {
      throw new Error('Student not found');
    }
    return student;
  }

  async findAdvisorByUserId(
    userId: number,
    relations?: FindOptionsRelations<Advisor>,
  ) {
    const user = await this.findUser(userId);
    const advisor = await this.advisorRepo.findOne({
      where: { user: user },
      relations: relations,
    });
    if (!advisor) {
      throw new Error('Advisor not found');
    }
    return advisor;
  }
}
