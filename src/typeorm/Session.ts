// src/domain/Session/Session.ts

import { ISession } from 'connect-typeorm';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity('sessions')
export class SessionEntity implements ISession {
  @Index()
  @Column('bigint')
  expiredAt = Date.now();

  @PrimaryColumn('varchar', { length: 255 })
  id = '';

  @Column('text')
  json = '';

  @DeleteDateColumn()
  destroyedAt?: Date;
}
