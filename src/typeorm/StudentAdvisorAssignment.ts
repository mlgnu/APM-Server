import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Student } from './Student';
import { Advisor } from './Advisor';
import { Assignment } from './Assignment';

@Entity({ name: 'student_advisor_assignments' })
export class StudentAdvisorAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  // @OneToOne(() => Student)
  // @JoinColumn({ name: 'student_email' })
  @Column({ name: 'student_email' })
  studentEmail: string;

  // @OneToOne(() => Advisor)
  // @JoinColumn({ name: 'advisor_email' })
  @Column({ name: 'advisor_email' })
  advisorEmail: string;

  @Column()
  year: number;

  @Column({ nullable: true })
  assignmentId: number;

  @ManyToOne(() => Assignment, (assignment) => assignment.assignmentId, {
    onDelete: 'CASCADE',
  })
  assignment: Assignment;
}
