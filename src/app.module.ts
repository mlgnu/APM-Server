import { Module } from '@nestjs/common';
import { CustomerModule } from './customer/customer.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from './authentication/authentication.module';
import entities, { User } from './typeorm';
import { PassportModule } from '@nestjs/passport';
import { ProfileModule } from './profile/profile.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { AssignmentModule } from './assignment/assignment.module';

@Module({
  imports: [
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
