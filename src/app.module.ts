import { Module } from '@nestjs/common';
import { CustomerModule } from './customer/customer.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from './authentication/authentication.module';
import entities, { User } from './typeorm';
import { PassportModule } from '@nestjs/passport';
import { ProfileModule } from './profile/profile.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { AssignmentModule } from './assignment/assignment.module';
import { MessageModule } from './message/message.module';
import { MonitorModule } from './monitor/monitor.module';
import { ConfigModule } from '@nestjs/config';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CustomerModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'mohamed',
      password: '',
      database: 'academic_progression_monitoring',
      entities: entities,
      synchronize: true,
    }),
    AuthenticationModule,
    ProfileModule,
    AnnouncementsModule,
    AssignmentModule,
    MessageModule,
    MonitorModule,
    FeedbackModule,
  ],
  controllers: [],
})
export class AppModule {}
