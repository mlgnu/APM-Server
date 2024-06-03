import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dtos/CreateMessageDto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/typeorm/Message';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { Student } from 'src/typeorm/Student';
import { User } from 'src/typeorm';
import { StudentAdvisorAssignment } from 'src/typeorm/StudentAdvisorAssignment';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    private readonly authService: AuthenticationService,
    private readonly dataSource: DataSource,
  ) {}

  async getMessageById(id: number) {
    return await this.messageRepo.findOneBy({ id });
  }

  async getChat(senderId: number, recieverId: number, isAdvisor: boolean) {
    console.log(senderId, recieverId);
    if (isAdvisor) {
      const advisor = await this.authService.findAdvisorByUserId(senderId, {
        students: true,
      });
      senderId = advisor.id;
    } else if (!isAdvisor) {
      const student = await this.authService.findStudentByUserId(senderId, {
        advisor: true,
      });
      senderId = student.id;
    }
    const chat = await this.messageRepo.find({
      where: [
        { senderId, recieverId },
        { senderId: recieverId, recieverId: senderId },
      ],
      order: { timestamp: 'ASC' },
    });

    const chatWithSender = chat.map((message) => ({
      ...message,
      isSender: message.senderId === senderId,
    }));

    return chatWithSender;
  }

  async createMessageStudent(createMessageDto: CreateMessageDto, id: number) {
    console.log(createMessageDto);
    console.log(id);

    const student = await this.authService.findStudentByUserId(id);

    const message = this.messageRepo.create({
      senderId: student.id,
      recieverId: createMessageDto.recieverId,
      content: createMessageDto.message,
    });

    return await this.messageRepo.save(message);
  }

  async createMessageAdvisor(createMessageDto: CreateMessageDto, id: number) {
    console.log(createMessageDto);
    console.log(id);

    const advisor = await this.authService.findAdvisorByUserId(id);

    const message = this.messageRepo.create({
      senderId: advisor.id,
      recieverId: createMessageDto.recieverId,
      content: createMessageDto.message,
    });

    return this.messageRepo.save(message);
  }
  async getContacts(email: string, role: number) {
    if (role == 1) {
      const contacts = await this.dataSource
        .createQueryBuilder(User, 'u')
        .select([
          's.student_id',
          's.department',
          's.firstName',
          's.lastName',
          'u.userEmail',
        ])
        .innerJoin('students', 's', 's.user_id = u.user_id')
        .where((qb) => {
          const sub = qb
            .subQuery()
            .select('saa.student_email')
            .from(StudentAdvisorAssignment, 'saa')
            .innerJoin('assignments', 'a', 'a.assignmentId = saa.assignmentId')
            .where('a.status = :status', { status: 'approved' })
            .andWhere('saa.advisor_email = :email', { email })
            .getQuery();
          return 'u.userEmail IN ' + sub;
        })
        .getRawMany();

      console.log(contacts);

      return contacts.map((contact) => ({
        id: contact.student_id,
        department: contact.s_department,
        firstName: contact.s_first_name,
        lastName: contact.s_last_name,
        userEmail: contact.u_user_Email,
      }));
    } else if (role == 0) {
      const contacts = await this.dataSource
        .createQueryBuilder(User, 'u')
        .select([
          's.advisor_id',
          's.department',
          's.firstName',
          's.lastName',
          'u.userEmail',
        ])
        .innerJoin('advisors', 's', 's.user_id = u.user_id')
        .where((qb) => {
          const sub = qb
            .subQuery()
            .select('saa.advisor_email')
            .from(StudentAdvisorAssignment, 'saa')
            .innerJoin('assignments', 'a', 'a.assignmentId = saa.assignmentId')
            .where('a.status = :status', { status: 'approved' })
            .andWhere('saa.student_email = :email', { email })
            .getQuery();
          return 'u.userEmail IN ' + sub;
        })
        .getRawMany();

      console.log(contacts, 'dd');

      return contacts.map((contact) => ({
        id: contact.advisor_id,
        department: contact.s_department,
        firstName: contact.s_first_name,
        lastName: contact.s_last_name,
        userEmail: contact.u_user_Email,
      }));
    }
  }
}
