import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { SlotType, ReservationType } from '../entities/parking-slot.entity';

export class QueryParkingSlotDto {
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
    description: 'Filter by floor ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  floorId?: number;

  @ApiProperty({
    description: 'Search by slot number',
    example: 'A-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  slotNumber?: string;

  @ApiProperty({
    description: 'Filter by slot type',
    enum: SlotType,
    required: false,
  })
  @IsOptional()
  @IsEnum(SlotType)
  slotType?: SlotType;

  @ApiProperty({
    description: 'Filter by reservation type',
    enum: ReservationType,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReservationType)
  reservationType?: ReservationType;

  @ApiProperty({
    description: 'Filter by occupation status',
    example: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isOccupied?: boolean;

  @ApiProperty({
    description: 'Filter by maintenance status',
    example: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isMaintenance?: boolean;
}
