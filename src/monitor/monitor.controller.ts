import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { Request } from 'express';
import { ScheduleSessionDto } from './dtos/ScheduleSessionDto';
import { JWTGuard } from 'src/authentication/utils/jwt.gurad';
import { RolesGuards } from 'src/authentication/utils/roles.guard';
import { Roles } from 'src/authentication/utils/roles.decorator';

@UseGuards(JWTGuard, RolesGuards)
@Controller('monitor')
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  @Roles('advisor')
  @Get('students')
  async getStudentsByAdvisorId(@Req() req: Request) {
    return this.monitorService.getAllstudentsByAdvisorId(
      req['user']['userEmail'],
    );
  }

  @Roles('advisor')
  @Get('advisor')
  async getAdvisorEvents(
    @Req() req: Request,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.monitorService.getAdvisorEvents(req['user']['id'], page, limit);
  }

  @Roles('student')
  @Get('student')
  async getStudentEvents(
    @Req() req: Request,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.monitorService.getStudentsEvents(
      req['user']['id'],
      page,
      limit,
    );
  }

  @Post()
  @Roles('advisor')
  @UsePipes(ValidationPipe)
  async createEvent(
    @Req() req: Request,
    @Body() scheduleSessionDto: ScheduleSessionDto,
  ) {
    console.log(scheduleSessionDto);
    return this.monitorService.createEvent(
      scheduleSessionDto,
      req['user']['id'],
      req.user['access_token'],
      req.user['refresh_token'],
    );
  }

  @Patch(':id')
  @Roles('advisor')
  @UsePipes(ValidationPipe)
  async editEvent(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Body() scheduleSessionDto: ScheduleSessionDto,
  ): Promise<any> {
    console.log(scheduleSessionDto);
    return this.monitorService.editEvent(
      scheduleSessionDto,
      id,
      req.user['access_token'],
      req.user['refresh_token'],
    );
  }

  @Delete(':id')
  @Roles('advisor')
  async deleteEvent(@Req() req: Request, @Param('id') id: string) {
    return this.monitorService.deleteEvent(
      id,
      req.user['access_token'],
      req.user['refresh_token'],
    );
  }
}
