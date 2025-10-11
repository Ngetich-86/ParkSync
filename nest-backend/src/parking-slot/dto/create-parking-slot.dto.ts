import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { VehicleType, ReservationType } from '../entities/parking-slot.entity';

export class CreateParkingSlotDto {
  @ApiProperty({
    description: 'Floor ID where the parking slot is located',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  floorId?: number;

  @ApiProperty({
    description: 'Unique slot number within the floor',
    example: 'A-001',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  slotNumber: string;

  @ApiProperty({
    description: 'Type of vehicle that can park in this slot',
    enum: VehicleType,
    example: VehicleType.FOUR_WHEELER,
  })
  @IsEnum(VehicleType)
  slotType: VehicleType;

  @ApiProperty({
    description: 'Reservation type of the parking slot',
    enum: ReservationType,
    example: ReservationType.PUBLIC,
  })
  @IsEnum(ReservationType)
  reservationType: ReservationType;

  @ApiProperty({
    description: 'Whether the slot is currently occupied',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isOccupied?: boolean;

  @ApiProperty({
    description: 'Whether the slot is under maintenance',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isMaintenance?: boolean;
}

