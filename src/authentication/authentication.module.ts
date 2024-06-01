import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { GoogleStrategy } from './utils/GoogleStrategy';
import { User } from 'src/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionSerializer } from './utils/Serializer';
import { PassportModule } from '@nestjs/passport';
import { Student } from 'src/typeorm/Student';
import { Advisor } from 'src/typeorm/Advisor';
import { Coordinator } from 'src/typeorm/Coordinator';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student, Advisor, Coordinator]),
    PassportModule.register({ session: true }),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, GoogleStrategy, SessionSerializer],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
