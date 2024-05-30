import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { Activity } from 'src/typeorm/Activity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { Student } from 'src/typeorm/Student';
import { Coordinator } from 'src/typeorm/Coordinator';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, Student, Coordinator]),
    AuthenticationModule,
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
})
export class ActivityModule {}
