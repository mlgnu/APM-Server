import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm';
import { Advisor } from 'src/typeorm/Advisor';
import { Student } from 'src/typeorm/Student';
import { StudentAdvisorAssignment } from 'src/typeorm/StudentAdvisorAssignment';
import { Assignment } from 'src/typeorm/Assignment';
import { Coordinator } from 'src/typeorm/Coordinator';
import { AuthenticationModule } from 'src/authentication/authentication.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Advisor,
      StudentAdvisorAssignment,
      Student,
      Assignment,
      Coordinator,
    ]),
    AuthenticationModule,
  ],
  controllers: [AssignmentController],
  providers: [AssignmentService],
})
export class AssignmentModule {}
