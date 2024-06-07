import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import { TypeormStore } from 'connect-typeorm';
import { DataSource } from 'typeorm';
import { SessionEntity } from './typeorm/Session';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const sessionRepo = app.get(DataSource).getRepository(SessionEntity);
  const typeormStore = new TypeormStore({ cleanupLimit: 10 }).connect(
    sessionRepo,
  );

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get('CLIENT_URL') || 'http://localhost:5173',
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  app.set('trust proxy', 1);
  // app.use(
  //   session({
  //     name: 'SESSION_ID',
  //     secret: 'asgpjkwaepogmoiawehgjoaiwejfoiamnwosigja',
  //     saveUninitialized: false,
  //     resave: false,
  //     cookie: {
  //       sameSite: 'none',
  //       secure: true,
  //       httpOnly: true,
  //       maxAge: 1000 * 60 * 60 * 24 * 7,
  //     },
  //     store: typeormStore,
  //   }),
  // );

  // app.use(passport.initialize());
  // app.use(passport.session());

  await app.listen(3001);
}
bootstrap();
