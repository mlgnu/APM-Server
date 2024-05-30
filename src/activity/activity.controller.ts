import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { createActivityDto } from './dtos/createActivity.dto';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

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

  @Get()
  async getActivities(@Req() req: Request) {
    return this.activityService.getActivities(req['user']['id'], 1, 10);
  }
}
