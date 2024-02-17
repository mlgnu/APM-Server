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
  Response,
  HttpStatus,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/CreateUserDto';
import { log } from 'console';
import { GoogleAuthGuard } from './utils/Guards';

@Controller('auth/google')
export class AuthenticationController {
  @Post('')
  @UsePipes(ValidationPipe)
  createUser(@Body() createUserDto: CreateUserDto) {
    log(createUserDto);
  }

  @Get('login')
  @UseGuards(GoogleAuthGuard)
  handleAuth() {
    return {
      msg: 'google',
    };
  }
  // I want to check if the user is logged in or not please

  @Get('redirect')
  @UseGuards(GoogleAuthGuard)
  handleRedirect(@Request() req: any, @Response() res: any) {
    if (req.user) {
      res.redirect(HttpStatus.TEMPORARY_REDIRECT, 'http://localhost:5173');
    }
  }

  @Get('logout')
  logout(@Request() req: any, @Response() res: any) {
    req.logout(function (err) {
      if (err) {
        return console.log(err);
      }
      res.location('/');
      res.status(HttpStatus.TEMPORARY_REDIRECT).end();
      // res.redirect(HttpStatus.TEMPORARY_REDIRECT, 'http://localhost:5173');
    });
    // res.redirect(HttpStatus.TEMPORARY_REDIRECT, 'http://localhost:5173');
  }
}
