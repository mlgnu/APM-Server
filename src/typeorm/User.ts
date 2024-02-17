import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn({
    name: 'user_id',
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'user_email',
    nullable: false,
  })
  userEmail: string;

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
    default: 0,
  })
  role: number;

  @Column({
    nullable: true,
  })
  department: string;
}
