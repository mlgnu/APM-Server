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

@Entity({ name: 'monitoring_sessions' })
export class MonitoringSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'google_id', unique: true })
  googleId: string;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ name: 'advisor_id' })
  advisorId: number;

  @Column()
  date: Date;

  @Column({ type: 'boolean', name: 'is_online' })
  isOnline: boolean;

  @Column()
  venue: string;

  @Column({ type: 'time', name: 'time_start' })
  timeStart: string;

  @Column({ type: 'time', name: 'time_end' })
  timeEnd: string;
}
