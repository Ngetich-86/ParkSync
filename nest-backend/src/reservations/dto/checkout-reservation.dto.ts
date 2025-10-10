import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsNumber, IsEnum, Min } from 'class-validator';
import { PaymentStatus } from '../entities/reservation.entity';

export class CheckoutReservationDto {
  @ApiProperty({
    description: 'Vehicle exit time',
    example: '2024-01-15T11:55:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  exitTime: string;

  @ApiProperty({
    description: 'Total amount for the reservation',
    example: 15.50,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
  })
  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;
}
