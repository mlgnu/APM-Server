import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Advisor } from './Advisor';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn({ name: 'student_id' })
  id: number;

  @Column({
    name: 'first_name',
    nullable: false,
  })
  firstName: string;

  @Column({
    name: 'last_name',
    nullable: false,
  })
  lastName: string;

  @Column({
    nullable: true,
  })
  department: string;

  // @Column({ name: 'user_id', type: 'int', nullable: true })
  // userId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Advisor, (advisor) => advisor.students)
  advisor: Advisor;
}
