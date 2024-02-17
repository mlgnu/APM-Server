import { IsNotEmpty, IsNumberString } from 'class-validator';

export class UpdateUserDto {
  @IsNumberString()
  id: number;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  department: string;
}
