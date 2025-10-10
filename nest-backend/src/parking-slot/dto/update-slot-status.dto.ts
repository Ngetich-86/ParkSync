import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateSlotStatusDto {
  @ApiProperty({
    description: 'Whether the slot is occupied',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  isOccupied: boolean;

  @ApiProperty({
    description: 'Whether the slot is under maintenance',
    example: false,
  })
  @IsNotEmpty()
  @IsBoolean()
  isMaintenance: boolean;
}
