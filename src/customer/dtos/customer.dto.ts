import { IsNotEmpty, IsNumberString } from "class-validator";

export class CustomerDto {
    @IsNotEmpty()
    id : String;

    @IsNotEmpty()
    name : String;

    @IsNumberString()
    age : number;
}