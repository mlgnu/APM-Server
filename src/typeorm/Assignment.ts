import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Coordinator } from './Coordinator';
import { Department } from 'types';
import { StudentAdvisorAssignment } from './StudentAdvisorAssignment';

export enum AssignmentStatus {
  PENDING = 'pending',
  REJECTED = 'rejected',
  APPROVED = 'approved',
}

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn()
  assignmentId: number;

  @Column({
    name: 'assignment_status',
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.PENDING,
    nullable: true,
  })
  status: AssignmentStatus;

  @Column({ type: 'enum', enum: Department, nullable: true })
  department: Department;

  @Column({})
  year: number;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  @Column({ nullable: true, type: 'text' })
  message: string;

  // @Column({ name: 'coordinator_id', nullable: true })
  @ManyToOne(() => Coordinator)
  @JoinColumn({ name: 'coordinator_id' })
  coordinator: Coordinator;
  // coordinator: Coordinator;

  @OneToMany(
    () => StudentAdvisorAssignment,
    (studentAdvisorAssignment) => studentAdvisorAssignment.assignment,
    { onDelete: 'CASCADE' },
  )
  studentAdvisorAssignments: StudentAdvisorAssignment[];
}
