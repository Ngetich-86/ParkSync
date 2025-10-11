import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, IsDateString, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ReservationStatus } from '../entities/reservation.entity';
import { PaymentStatus } from '../../common/enums';

export class QueryReservationDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Filter by vehicle ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  vehicleId?: number;

  @ApiProperty({
    description: 'Filter by parking slot ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  slotId?: number;

  @ApiProperty({
    description: 'Filter by reservation status',
    enum: ReservationStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiProperty({
    description: 'Filter by payment status',
    enum: PaymentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({
    description: 'Filter by start date (from)',
    example: '2024-01-15T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiProperty({
    description: 'Filter by start date (to)',
    example: '2024-01-15T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @ApiProperty({
    description: 'Filter by end date (from)',
    example: '2024-01-15T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDateFrom?: string;

  @ApiProperty({
    description: 'Filter by end date (to)',
    example: '2024-01-15T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDateTo?: string;
}

