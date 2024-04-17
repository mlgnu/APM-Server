import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  MinLength,
  isNumber,
} from 'class-validator';

export class CreateMessageDto {
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  recieverId: number;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @MinLength(1)
  message: string;
}
