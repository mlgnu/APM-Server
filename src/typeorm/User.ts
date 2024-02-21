import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({
    name: 'user_id',
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'user_email',
    nullable: false,
    unique: true,
  })
  userEmail: string;

  @Column({
    default: 0,
  })
  role: number;
}
