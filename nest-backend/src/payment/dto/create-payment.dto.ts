import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsEmail, IsOptional, Min, IsObject } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Payment amount in INR',
    example: 150.50,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'INR',
    default: 'INR',
    required: false,
  })
  @IsOptional()
  @IsString()
  currency?: string = 'INR';

  @ApiProperty({
    description: 'Customer name',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  customerName: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  customerEmail: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '+919876543210',
  })
  @IsNotEmpty()
  @IsString()
  customerPhone: string;

  @ApiProperty({
    description: 'Additional notes for the payment',
    example: { parkingSessionId: 'uuid-here', slotNumber: 'A-001' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  notes?: Record<string, any>;
}
