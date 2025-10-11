import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'Razorpay order ID',
    example: 'order_1234567890',
  })
  @IsNotEmpty()
  @IsString()
  razorpayOrderId: string;

  @ApiProperty({
    description: 'Razorpay payment ID',
    example: 'pay_1234567890',
  })
  @IsNotEmpty()
  @IsString()
  razorpayPaymentId: string;

  @ApiProperty({
    description: 'Razorpay signature for verification',
    example: 'signature_1234567890',
  })
  @IsNotEmpty()
  @IsString()
  razorpaySignature: string;
}
