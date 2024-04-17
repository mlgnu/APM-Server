import { Module } from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { MonitorController } from './monitor.controller';
import { Advisor } from 'src/typeorm/Advisor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { MonitoringSession } from 'src/typeorm/MonitoringSession';
import { Student } from 'src/typeorm/Student';

@Module({
  controllers: [MonitorController],
  providers: [MonitorService],
  imports: [
    TypeOrmModule.forFeature([Advisor, MonitoringSession, Student]),
    AuthenticationModule,
  ],
})
export class MonitorModule {}
