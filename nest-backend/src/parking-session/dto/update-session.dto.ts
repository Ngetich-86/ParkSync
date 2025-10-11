import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateParkingSessionDto {
  @ApiProperty({
    description: 'Vehicle exit time',
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
