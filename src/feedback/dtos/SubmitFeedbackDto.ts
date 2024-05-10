import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SubmitFeedbackDto {
  @IsNotEmpty()
  @IsNumber()
  rating: number;

  @IsNotEmpty()
  @IsString()
  feedback: string;

  @IsNotEmpty()
  @IsNumber()
  sessionId: number;
}
