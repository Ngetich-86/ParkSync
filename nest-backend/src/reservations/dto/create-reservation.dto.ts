import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
  Min,
  ValidateIf,
  IsString,
  IsBoolean,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { ReservationStatus } from '../entities/reservation.entity';
import { PaymentStatus, NotificationType } from '../../common/enums';

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
    description: 'Amount paid for the reservation',
    example: 15.50,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;

  @ApiProperty({
    description: 'Additional notes for the reservation',
    example: 'Customer requested ground floor',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Customer name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.RESERVED,
    required: false,
  })
  @IsOptional()
  @IsEnum(NotificationType)
  notificationType?: NotificationType;

  @ApiProperty({
    description: 'Whether the reservation has been extended',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isExtended?: boolean;

  @ApiProperty({
    description: 'Number of times the reservation has been extended',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  extensionCount?: number;

  @ApiProperty({
    description: 'Last extension time',
    example: '2024-01-15T12:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  lastExtensionTime?: string;
}

