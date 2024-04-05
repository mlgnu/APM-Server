import {
  IsArray,
  IsEnum,
  IsNumberString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Department } from 'types';
import { AssignmentDto } from './AssignToAdvisorDto';

export class AssignmentDetailsDto {
  @IsNumberString()
  batchYear: string;

  @IsEnum(Department, {
    message: 'department must be a valid department within FSKTM',
  })
  department: Department;

  @IsNumberString()
  coordinatorId: number;

  @IsArray()
  @ValidateNested({ each: true })
  assignments: AssignmentDto[];
}
