import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { Student } from './Student';

@Entity('advisors')
export class Advisor {
  @PrimaryGeneratedColumn({ name: 'advisor_id' })
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

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Student, (student) => student.advisor)
  students: Student[];
}
