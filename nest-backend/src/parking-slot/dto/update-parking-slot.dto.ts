import { PartialType } from '@nestjs/swagger';
import { CreateParkingSlotDto } from './create-parking-slot.dto';

export class UpdateParkingSlotDto extends PartialType(CreateParkingSlotDto) {}
