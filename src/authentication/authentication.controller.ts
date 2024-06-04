import {
  Body,
  Controller,
  Get,
  Post,
  Session,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
  HttpStatus,
  Res,
  Delete,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/CreateUserDto';
import { log } from 'console';
import { GoogleAuthGuard, LoginGuard } from './utils/Guards';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

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
  // I want to check if the user is logged in or not please
  @Get('redirect')
  @UseGuards(GoogleAuthGuard)
  googleLoginCallback(@Request() req, @Res() res: Response) {
    const googleToken = req.user.accessToken;
    const googleRefreshToken = req.user.refreshToken;

    res.cookie('access_token', googleToken, {
      secure: true,
      sameSite: 'lax',
      httpOnly: true,
      domain: 'onrender.com',
      path: '/',
    });
    res.cookie('refresh_token', googleRefreshToken, {
      httpOnly: true,
      domain: 'onrender.com',
    });

    res.redirect(this.configService.getOrThrow('CLIENT_URL'));
  }
  handleRedirect(@Request() req: any, @Res() res: any) {
    console.log(req.user);
    if (req.isAuthenticated()) {
      res.redirect(HttpStatus.TEMPORARY_REDIRECT, 'http://localhost:5173');
    }
  }

  @Delete('logout')
  logout(@Request() req: any, @Res() res: Response) {
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
