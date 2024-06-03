import { IsNumberString } from 'class-validator';
import { AssignmentDetailsDto } from './AssignmentDetailsDto';

export class EditAssignmentDto extends AssignmentDetailsDto {
  @IsNumberString()
  assignmentId: number;
}
