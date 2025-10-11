import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingSlotService } from './parking-slot.service';
import { ParkingSlotController } from './parking-slot.controller';
import { ParkingSlot } from './entities/parking-slot.entity';
import { User } from '../users/entities/user.entities';

@Module({
  imports: [TypeOrmModule.forFeature([ParkingSlot, User])],
  controllers: [ParkingSlotController],
  providers: [ParkingSlotService],
  exports: [ParkingSlotService],
})
export class ParkingSlotModule {}

