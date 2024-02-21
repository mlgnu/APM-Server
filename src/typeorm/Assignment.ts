import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'assignments' })
export class Assignment {
  @PrimaryGeneratedColumn({
    name: 'assignment_id',
    type: 'bigint',
  })
  id: number;

  @Column()
  student_id: number;

  @Column()
  supervisor_id: number;

  @Column()
  collection_id: number;
}
