import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  Matches,
  MaxLength,
} from 'class-validator';
import { VehicleType } from '../entities/vehicle.entity';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'License plate number',
    example: 'ABC-1234',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'License plate must contain only uppercase letters, numbers, and hyphens',
  })
  licensePlate: string;

  @ApiProperty({
    description: 'Type of vehicle',
    enum: VehicleType,
    example: VehicleType.FOUR_WHEELER,
  })
  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @ApiProperty({
    description: 'Owner name',
    example: 'John Doe',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ownerName?: string;

  @ApiProperty({
    description: 'Owner email address',
    example: 'john.doe@example.com',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  ownerEmail?: string;

  @ApiProperty({
    description: 'Owner phone number',
    example: '+1234567890',
    required: false,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[\+]?[1-9][\d]{0,15}$/, {
    message: 'Phone number must be a valid international format',
  })
  ownerPhone?: string;
}


