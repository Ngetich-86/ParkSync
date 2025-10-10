import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { Vehicle } from './entities/vehicle.entity';
import { User } from '../users/entities/user.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, User])],
  controllers: [VehicleController],
  providers: [VehicleService],
  exports: [VehicleService],
})
export class VehicleModule {}

