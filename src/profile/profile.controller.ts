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
import { JWTGuard } from 'src/authentication/utils/jwt.gurad';
import { RolesGuards } from 'src/authentication/utils/roles.guard';
import { Roles } from 'src/authentication/utils/roles.decorator';

@Controller('profile')
@UseGuards(JWTGuard, RolesGuards)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('')
  @Roles('student', 'advisor', 'coordinator', 'supervisor')
  getCurrentUser(@Req() req: Request) {
    return this.profileService.getCurrentUser(req);
  }

  @Roles('student', 'advisor')
  @Get('profile')
  getUserProfile(@Req() req: Request) {
    return this.profileService.getUserProfile(
      req['user']['id'],
      req['user']['role'],
    );
  }
  @Roles('student', 'advisor')
  @Post('update')
  @UsePipes(ValidationPipe)
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
  @Roles('student', 'advisor')
  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.profileService.getUserById(id);
  }
}
