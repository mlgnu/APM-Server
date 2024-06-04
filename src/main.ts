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

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const sessionRepo = app.get(DataSource).getRepository(SessionEntity);
  const typeormStore = new TypeormStore({ cleanupLimit: 10 }).connect(
    sessionRepo,
  );

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: 'https://apm-client.onrender.com',
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  app.use(
    session({
      name: 'SESSION_ID',
      secret: 'asgpjkwaepogmoiawehgjoaiwejfoiamnwosigja',
      saveUninitialized: false,
      resave: false,
      cookie: {
        sameSite: 'lax',
        domain: '.onrender.com',
        maxAge: 1000 * 60 * 60 * 24,
      },
      store: typeormStore,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3001);
}
bootstrap();
