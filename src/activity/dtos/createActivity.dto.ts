import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsDateString,
} from 'class-validator';

export class createActivityDto {
  @IsNotEmpty()
  @IsNumber()
  studentId: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;
}
