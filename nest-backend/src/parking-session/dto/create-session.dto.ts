import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateParkingSessionDto {
  @ApiProperty({
    description: 'Vehicle ID for the parking session',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  vehicleId: number;

  @ApiProperty({
    description: 'Parking slot ID for the session',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  slotId: number;

  @ApiProperty({
    description: 'Vehicle entry time',
    example: '2024-01-15T10:05:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  entryTime?: string;

  @ApiProperty({
    description: 'Vehicle exit time (optional for new sessions)',
    example: '2024-01-15T11:55:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  exitTime?: string;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 120,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @ApiProperty({
    description: 'Amount paid for the session',
    example: 15.50,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;
}
