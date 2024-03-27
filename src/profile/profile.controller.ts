import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  Delete,
  Req,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from 'src/typeorm';
import { UpdateUserDto } from 'src/profile/dtos/UpdateUserDto';
import { GoogleAuthGuard, LoginGuard } from 'src/authentication/utils/Guards';
import { Request } from 'express';

console.log('lol');
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('')
  @UseGuards(LoginGuard)
  getCurrentUser(@Req() req: Request) {
    return this.profileService.getCurrentUser(req);
  }
  @Get('profile')
  getUserProfile(@Req() req: Request) {
    return this.profileService.getUserProfile(
      req['user']['id'],
      req['user']['role'],
    );
  }
  @Post('update')
  @UsePipes(ValidationPipe)
  @UseGuards(LoginGuard)
  updateUserById(@Body() updateUser: UpdateUserDto, @Req() req: Request) {
    return this.profileService.updateUser(
      updateUser,
      req['user']['id'],
      req['user']['role'],
    );
  }
  @Delete()
  deleteUser(@Req() req: any) {
    // return this.profileService.deleteUser(req);
  }
  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.profileService.getUserById(id);
  }
}
