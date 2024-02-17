import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from 'src/typeorm';
import { UpdateUserDto } from 'src/profile/dtos/UpdateUserDto';
import { GoogleAuthGuard, LoginGuard } from 'src/authentication/utils/Guards';

console.log('lol');
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.profileService.getUserById(id);
  }

  @Get('')
  @UseGuards(LoginGuard)
  getCurrentUser(@Request() req: any) {
    const n = 'fff';
    return this.profileService.getCurrentUser(req);
  }
  @Post('update')
  @UsePipes(ValidationPipe)
  updateUserById(@Body() updateUser: UpdateUserDto) {
    return this.profileService.updateUser(updateUser);
  }
}
