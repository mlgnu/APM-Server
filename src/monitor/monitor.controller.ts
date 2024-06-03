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
import { LoginGuard } from 'src/authentication/utils/Guards';
import { Request } from 'express';
import { ScheduleSessionDto } from './dtos/ScheduleSessionDto';

@Controller('monitor')
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  @Get('students')
  @UseGuards(LoginGuard)
  async getStudentsByAdvisorId(@Req() req: Request) {
    return this.monitorService.getAllstudentsByAdvisorId(
      req['user']['userEmail'],
    );
  }

  @Get('advisor')
  async getAdvisorEvents(
    @Req() req: Request,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.monitorService.getAdvisorEvents(req['user']['id'], page, limit);
  }

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
  @UsePipes(ValidationPipe)
  @UseGuards(LoginGuard)
  async createEvent(
    @Req() req: Request,
    @Body() scheduleSessionDto: ScheduleSessionDto,
  ) {
    console.log(scheduleSessionDto);
    return this.monitorService.createEvent(
      scheduleSessionDto,
      req['user']['id'],
      req.cookies['access_token'],
      req.cookies['refresh_token'],
    );
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  @UseGuards(LoginGuard)
  async editEvent(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Body() scheduleSessionDto: ScheduleSessionDto,
  ): Promise<any> {
    console.log(scheduleSessionDto);
    return this.monitorService.editEvent(
      scheduleSessionDto,
      id,
      req.cookies['access_token'],
      req.cookies['refresh_token'],
    );
  }

  @Delete(':id')
  async deleteEvent(@Req() req: Request, @Param('id') id: string) {
    return this.monitorService.deleteEvent(
      id,
      req.cookies['access_token'],
      req.cookies['refresh_token'],
    );
  }
}
