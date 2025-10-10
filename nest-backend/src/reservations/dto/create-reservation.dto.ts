import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
  Min,
  ValidateIf,
} from 'class-validator';
import { ReservationStatus, PaymentStatus } from '../entities/reservation.entity';

export class CreateReservationDto {
  @ApiProperty({
    description: 'Vehicle ID for the reservation',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  vehicleId: number;

  @ApiProperty({
    description: 'Parking slot ID for the reservation',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  slotId: number;

  @ApiProperty({
    description: 'Reservation start time',
    example: '2024-01-15T10:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'Reservation end time',
    example: '2024-01-15T12:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @ApiProperty({
    description: 'Reservation status',
    enum: ReservationStatus,
    example: ReservationStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiProperty({
    description: 'Vehicle entry time',
    example: '2024-01-15T10:05:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  entryTime: string;

  @ApiProperty({
    description: 'Vehicle exit time (optional for new reservations)',
    example: '2024-01-15T11:55:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  exitTime?: string;

  @ApiProperty({
    description: 'Total amount for the reservation',
    example: 15.50,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}
