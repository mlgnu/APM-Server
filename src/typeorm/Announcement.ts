import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'announcements' })
export class Announcement {
  @PrimaryGeneratedColumn({
    name: 'announcement_id',
    type: 'bigint',
  })
  id: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: false, type: 'text' })
  announcement: string;

  @CreateDateColumn()
  created_at: Date;
}
