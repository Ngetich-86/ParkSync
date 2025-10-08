import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { UserRole } from "src/users/entities/user.entities";

export class SignUpDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    role: UserRole

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    first_name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    last_name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    phone_number: string;
}