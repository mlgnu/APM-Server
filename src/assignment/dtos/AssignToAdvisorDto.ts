import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsNumberString,
  IsString,
  ValidateIf,
} from 'class-validator';

export class AssignmentDto {
  @IsNotEmpty()
  @IsString()
  advisorId: string;

  @IsNotEmpty()
  @IsString()
  studentId: string;
}
