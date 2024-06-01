import { IsNotEmpty, IsString } from 'class-validator';

export class RejectActivityDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
