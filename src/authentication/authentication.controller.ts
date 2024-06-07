import {
  Body,
  Controller,
  Get,
  Post,
  Session,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  Res,
  Delete,
  Req,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/CreateUserDto';
import { log } from 'console';
import { GoogleAuthGuard, LoginGuard } from './utils/Guards';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JWTGuard } from './utils/jwt.gurad';

@Controller('auth/google')
export class AuthenticationController {
  constructor(private readonly configService: ConfigService) {}
  @Post('')
  @UsePipes(ValidationPipe)
  createUser(@Body() createUserDto: CreateUserDto) {
    log(createUserDto);
  }

  @Get('login')
  @UseGuards(GoogleAuthGuard)
  google() {
    console.log('ajs');
  }

  @Get('redirect')
  @UseGuards(GoogleAuthGuard)
  googleLoginCallback(@Req() req: Request, @Res() res: Response) {
    console.log(req.user, 'from google login callback');
    res.redirect(
      `${this.configService.getOrThrow('CLIENT_URL')}?token=${req.user}`,
    );
  }

  @UseGuards(JWTGuard)
  @Get('test')
  test(@Req() req: Request) {
    console.log(req.user);
    return req.user;
  }
  @Delete('logout')
  logout(@Req() req: any, @Res() res: Response) {
    // req.logout(function (err) {
    //   if (err) {
    //     return console.log(err);
    //   }
    //   res.clearCookie('access_token');
    //   res.clearCookie('refresh_token');
    //   res.clearCookie('SESSION_ID');
    //   // res.location('/');
    //   // res.status(HttpStatus.TEMPORARY_REDIRECT).end();
    //   // res.redirect(HttpStatus.TEMPORARY_REDIRECT, 'http://localhost:5173');
    // });

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie('SESSION_ID');
    req.logOut(() => {
      req.session.destroy(() => {
        res.send('Logged out');
      });
    });
  }
}
