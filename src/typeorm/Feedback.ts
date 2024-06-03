import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MonitoringSession } from './MonitoringSession';

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'double precision' })
  rating: number;

  @Column({ type: 'text' })
  feedback: string;

  @Column({ name: 'session_id' })
  sessionId: number;

  @OneToOne(() => MonitoringSession)
  @JoinColumn({ name: 'session_id' })
  sesstionId: MonitoringSession;
}
