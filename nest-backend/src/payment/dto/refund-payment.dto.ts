import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class RefundPaymentDto {
  @ApiProperty({
    description: 'Payment ID to refund',
    example: 'payment-uuid-here',
  })
  @IsNotEmpty()
  @IsString()
  paymentId: string;

  @ApiProperty({
    description: 'Refund amount (if not provided, full amount will be refunded)',
    example: 100.50,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @ApiProperty({
    description: 'Reason for refund',
    example: 'Customer requested refund',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
