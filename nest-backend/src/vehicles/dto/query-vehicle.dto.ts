import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { VehicleType } from '../entities/vehicle.entity';

export class QueryVehicleDto {
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
    description: 'Search by license plate',
    example: 'ABC-1234',
    required: false,
  })
  @IsOptional()
  @IsString()
  licensePlate?: string;

  @ApiProperty({
    description: 'Filter by vehicle type',
    enum: VehicleType,
    required: false,
  })
  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;

  @ApiProperty({
    description: 'Search by owner name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  ownerName?: string;

  @ApiProperty({
    description: 'Search by owner email',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  ownerEmail?: string;
}
