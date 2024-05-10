import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { Roles } from 'src/authentication/utils/roles.decorator';
import { RolesGuards } from 'src/authentication/utils/roles.guard';
import { SubmitFeedbackDto } from './dtos/SubmitFeedbackDto';
import { Request } from 'express';

@Controller('feedback')
@UseGuards(RolesGuards)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Roles('advisor')
  async submitFeedback(@Body() feedback: SubmitFeedbackDto) {
    return this.feedbackService.submitFeedback(feedback);
  }

  @Get('dashboard')
  @Roles('advisor', 'student')
  async getDashboardFeedback(@Req() req: Request) {
    if (req['user']['role'] === 0) {
      return this.feedbackService.getStudentDashboardFeedback(
        req['user']['id'],
      );
    } else if (req['user']['role'] === 1) {
      return this.feedbackService.getDashboardFeedback(req['user']['id']);
    }
  }

  @Get(':id')
  @Roles('advisor', 'student')
  async getFeedback(@Param('id', ParseIntPipe) sessionId: number) {
    return this.feedbackService.getFeedback(sessionId);
  }
}
