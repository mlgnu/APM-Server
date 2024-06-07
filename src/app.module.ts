import { Module } from '@nestjs/common';
import { CustomerModule } from './customer/customer.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from './authentication/authentication.module';
import entities, { User } from './typeorm';
import { ProfileModule } from './profile/profile.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { AssignmentModule } from './assignment/assignment.module';
import { MessageModule } from './message/message.module';
import { MonitorModule } from './monitor/monitor.module';
import { ConfigModule } from '@nestjs/config';
import { FeedbackModule } from './feedback/feedback.module';
import { ActivityModule } from './activity/activity.module';
import { TypeOrmConfigService } from 'typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CustomerModule,
    TypeOrmModule.forRootAsync({
      inject: [TypeOrmConfigService],
      useClass: TypeOrmConfigService,
      imports: [ConfigModule],
    }),
    AuthenticationModule,
    ProfileModule,
    AnnouncementsModule,
    AssignmentModule,
    MessageModule,
    MonitorModule,
    FeedbackModule,
    ActivityModule,
  ],
  controllers: [],
})
export class AppModule {}
