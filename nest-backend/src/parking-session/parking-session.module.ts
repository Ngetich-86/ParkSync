import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingSessionService } from './parking-session.service';
import { ParkingSessionController } from './parking-session.controller';
import { ParkingSession } from './entities/parking-session.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { ParkingSlot } from '../parking-slot/entities/parking-slot.entity';
import { Payment } from '../payments/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ParkingSession, Vehicle, ParkingSlot, Payment]),
  ],
  controllers: [ParkingSessionController],
  providers: [ParkingSessionService],
  exports: [ParkingSessionService],
})
export class ParkingSessionModule {}
