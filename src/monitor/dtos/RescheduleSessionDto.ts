import { IsNumberString } from 'class-validator';
import { ScheduleSessionDto } from './ScheduleSessionDto';

export class RescheduleSessionDto extends ScheduleSessionDto {
  @IsNumberString()
  sessionId: number;
}
