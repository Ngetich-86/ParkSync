import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { ParkingSlot, VehicleType, ReservationType } from './entities/parking-slot.entity';
import { CreateParkingSlotDto } from './dto/create-parking-slot.dto';
import { UpdateParkingSlotDto } from './dto/update-parking-slot.dto';
import { QueryParkingSlotDto } from './dto/query-parking-slot.dto';
import { UpdateSlotStatusDto } from './dto/update-slot-status.dto';

@Injectable()
export class ParkingSlotService {
  constructor(
    @InjectRepository(ParkingSlot)
    private parkingSlotRepository: Repository<ParkingSlot>,
  ) {}

  async create(createParkingSlotDto: CreateParkingSlotDto): Promise<ParkingSlot> {
    // Check if slot number already exists on the same floor
    const existingSlot = await this.parkingSlotRepository.findOne({
      where: { 
        floorId: createParkingSlotDto.floorId,
        slotNumber: createParkingSlotDto.slotNumber 
      },
    });

    if (existingSlot) {
      throw new ConflictException(
        `Parking slot ${createParkingSlotDto.slotNumber} already exists on floor ${createParkingSlotDto.floorId}`,
      );
    }

    const parkingSlot = this.parkingSlotRepository.create(createParkingSlotDto);
    return await this.parkingSlotRepository.save(parkingSlot);
  }

  async findAll(queryDto: QueryParkingSlotDto): Promise<{
    data: ParkingSlot[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, ...filters } = queryDto;
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: any = {};
    
    if (filters.floorId) {
      where.floorId = filters.floorId;
    }
    
    if (filters.slotNumber) {
      where.slotNumber = Like(`%${filters.slotNumber}%`);
    }
    
    if (filters.slotType) {
      where.slotType = filters.slotType;
    }
    
    if (filters.reservationType) {
      where.reservationType = filters.reservationType;
    }
    
    if (filters.isOccupied !== undefined) {
      where.isOccupied = filters.isOccupied;
    }
    
    if (filters.isMaintenance !== undefined) {
      where.isMaintenance = filters.isMaintenance;
    }

    const findOptions: FindManyOptions<ParkingSlot> = {
      where,
      skip,
      take: limit,
      order: { floorId: 'ASC', slotNumber: 'ASC' },
    };

    const [data, total] = await this.parkingSlotRepository.findAndCount(findOptions);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<ParkingSlot> {
    const parkingSlot = await this.parkingSlotRepository.findOne({
      where: { parkingSlotId: id },
    });

    if (!parkingSlot) {
      throw new NotFoundException(`Parking slot with ID ${id} not found`);
    }

    return parkingSlot;
  }

  async findByFloorAndSlot(floorId: number, slotNumber: string): Promise<ParkingSlot> {
    const parkingSlot = await this.parkingSlotRepository.findOne({
      where: { floorId, slotNumber },
    });

    if (!parkingSlot) {
      throw new NotFoundException(
        `Parking slot ${slotNumber} not found on floor ${floorId}`,
      );
    }

    return parkingSlot;
  }

  async findAvailableSlots(
    slotType?: VehicleType,
    floorId?: number,
  ): Promise<ParkingSlot[]> {
    const where: any = {
      isOccupied: false,
      isMaintenance: false,
    };

    if (slotType) {
      where.slotType = slotType;
    }

    if (floorId) {
      where.floorId = floorId;
    }

    return await this.parkingSlotRepository.find({
      where,
      order: { floorId: 'ASC', slotNumber: 'ASC' },
    });
  }

  async update(id: number, updateParkingSlotDto: UpdateParkingSlotDto): Promise<ParkingSlot> {
    const parkingSlot = await this.findOne(id);

    // Check if slot number is being updated and if it already exists on the same floor
    if (
      updateParkingSlotDto.slotNumber &&
      updateParkingSlotDto.slotNumber !== parkingSlot.slotNumber
    ) {
      const existingSlot = await this.parkingSlotRepository.findOne({
        where: { 
          floorId: updateParkingSlotDto.floorId || parkingSlot.floorId,
          slotNumber: updateParkingSlotDto.slotNumber 
        },
      });

      if (existingSlot) {
        throw new ConflictException(
          `Parking slot ${updateParkingSlotDto.slotNumber} already exists on floor ${updateParkingSlotDto.floorId || parkingSlot.floorId}`,
        );
      }
    }

    Object.assign(parkingSlot, updateParkingSlotDto);
    return await this.parkingSlotRepository.save(parkingSlot);
  }

  async updateSlotStatus(id: number, updateStatusDto: UpdateSlotStatusDto): Promise<ParkingSlot> {
    const parkingSlot = await this.findOne(id);

    // Validate that a slot cannot be both occupied and under maintenance
    if (updateStatusDto.isOccupied && updateStatusDto.isMaintenance) {
      throw new BadRequestException(
        'A parking slot cannot be both occupied and under maintenance',
      );
    }

    parkingSlot.isOccupied = updateStatusDto.isOccupied;
    parkingSlot.isMaintenance = updateStatusDto.isMaintenance;

    return await this.parkingSlotRepository.save(parkingSlot);
  }

  async remove(id: number): Promise<{ message: string }> {
    const parkingSlot = await this.findOne(id);
    await this.parkingSlotRepository.remove(parkingSlot);
    return { message: `Parking slot with ID ${id} has been deleted successfully` };
  }

  async getParkingSlotStats(): Promise<{
    totalSlots: number;
    occupiedSlots: number;
    availableSlots: number;
    maintenanceSlots: number;
    twoWheelerSlots: number;
    fourWheelerSlots: number;
    reservedSlots: number;
    publicSlots: number;
  }> {
    const [
      totalSlots,
      occupiedSlots,
      maintenanceSlots,
      twoWheelerSlots,
      fourWheelerSlots,
      reservedSlots,
      publicSlots,
    ] = await Promise.all([
      this.parkingSlotRepository.count(),
      this.parkingSlotRepository.count({ where: { isOccupied: true } }),
      this.parkingSlotRepository.count({ where: { isMaintenance: true } }),
      this.parkingSlotRepository.count({ where: { slotType: VehicleType.TWO_WHEELER } }),
      this.parkingSlotRepository.count({ where: { slotType: VehicleType.FOUR_WHEELER } }),
      this.parkingSlotRepository.count({ where: { reservationType: ReservationType.RESERVED } }),
      this.parkingSlotRepository.count({ where: { reservationType: ReservationType.PUBLIC } }),
    ]);

    const availableSlots = totalSlots - occupiedSlots - maintenanceSlots;

    return {
      totalSlots,
      occupiedSlots,
      availableSlots,
      maintenanceSlots,
      twoWheelerSlots,
      fourWheelerSlots,
      reservedSlots,
      publicSlots,
    };
  }

  async getFloorStats(floorId: number): Promise<{
    floorId: number;
    totalSlots: number;
    occupiedSlots: number;
    availableSlots: number;
    maintenanceSlots: number;
    twoWheelerSlots: number;
    fourWheelerSlots: number;
  }> {
    const [
      totalSlots,
      occupiedSlots,
      maintenanceSlots,
      twoWheelerSlots,
      fourWheelerSlots,
    ] = await Promise.all([
      this.parkingSlotRepository.count({ where: { floorId } }),
      this.parkingSlotRepository.count({ where: { floorId, isOccupied: true } }),
      this.parkingSlotRepository.count({ where: { floorId, isMaintenance: true } }),
      this.parkingSlotRepository.count({ where: { floorId, slotType: VehicleType.TWO_WHEELER } }),
      this.parkingSlotRepository.count({ where: { floorId, slotType: VehicleType.FOUR_WHEELER } }),
    ]);

    const availableSlots = totalSlots - occupiedSlots - maintenanceSlots;

    return {
      floorId,
      totalSlots,
      occupiedSlots,
      availableSlots,
      maintenanceSlots,
      twoWheelerSlots,
      fourWheelerSlots,
    };
  }
}

