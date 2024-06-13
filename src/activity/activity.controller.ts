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
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { createActivityDto } from './dtos/createActivity.dto';
import { Roles } from 'src/authentication/utils/roles.decorator';
import { RejectActivityDto } from './dtos/RejectActivity.dto';
import { JWTGuard } from 'src/authentication/utils/jwt.gurad';
                                          
@UseGuards(JWTGuard)
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Roles('advisor')
  @Post()
  async createActivity(
    @Body() createActivityDto: createActivityDto,
    @Req() req: Request,
  ) {
    return this.activityService.createActivity(
      createActivityDto,
      req['user']['id'],
    );
  }

  @Roles('advisor')
  @Patch('/:id')
  async updateActivity(
    @Body() createActivityDto: createActivityDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.activityService.updateActivity(id, createActivityDto);
  }

  @Roles('advisor')
  @Delete('/:id')
  async deleteActivity(@Param('id', ParseIntPipe) id: number) {
    return this.activityService.deleteActivity(id);
  }

  @Roles('advisor', 'student', 'coordinator')
  @Get()
  async getActivities(
    @Req() req: Request,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    if (req['user']['role'] === 1) {
      return this.activityService.getActivities(req['user']['id'], page, limit);
    } else if (req['user']['role'] === 2) {
      console.log('fired');
      return this.activityService.getCoordinatorActivities(page, limit);
    } else if (req['user']['role'] === 0) {
      return this.activityService.getStudentActivities(
        req['user']['id'],
        page,
        limit,
      );
    }
  }

  @Roles('coordinator')
  @Patch('approve/:id/')
  async approveActivity(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    return this.activityService.approveActivity(id, req['user']['id']);
  }

  @Roles('coordinator')
  @Patch('reject/:id/')
  async rejectActivity(
    @Param('id') id: number,
    @Body() rejectDto: RejectActivityDto,
    @Req() req: Request,
  ) {
    console.log(rejectDto, 'rejectDto');
    return this.activityService.rejectActivity(
      id,
      rejectDto.message,
      req['user']['id'],
    );
  }
}