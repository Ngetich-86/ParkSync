import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions, IsNull } from 'typeorm';
import { ParkingSession } from './entities/parking-session.entity';
import { CreateParkingSessionDto } from './dto/create-session.dto';
import { UpdateParkingSessionDto } from './dto/update-session.dto';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { ParkingSlot } from '../parking-slot/entities/parking-slot.entity';

@Injectable()
export class ParkingSessionService {
  constructor(
    @InjectRepository(ParkingSession)
    private parkingSessionRepository: Repository<ParkingSession>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(ParkingSlot)
    private parkingSlotRepository: Repository<ParkingSlot>,
  ) {}

  async create(createSessionDto: CreateParkingSessionDto): Promise<ParkingSession> {
    // Validate vehicle exists
    const vehicle = await this.vehicleRepository.findOne({
      where: { vehicleId: createSessionDto.vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException(
        `Vehicle with ID ${createSessionDto.vehicleId} not found`,
      );
    }

    // Validate parking slot exists
    const parkingSlot = await this.parkingSlotRepository.findOne({
      where: { parkingSlotId: createSessionDto.slotId },
    });

    if (!parkingSlot) {
      throw new NotFoundException(
        `Parking slot with ID ${createSessionDto.slotId} not found`,
      );
    }

    // Check if slot is already occupied
    const activeSession = await this.parkingSessionRepository.findOne({
      where: {
        slotId: createSessionDto.slotId,
        exitTime: IsNull(), // Active session (no exit time)
      },
    });

    if (activeSession) {
      throw new ConflictException(
        `Parking slot ${createSessionDto.slotId} is already occupied`,
      );
    }

    // Check if vehicle is already parked
    const vehicleActiveSession = await this.parkingSessionRepository.findOne({
      where: {
        vehicleId: createSessionDto.vehicleId,
        exitTime: IsNull(), // Active session (no exit time)
      },
    });

    if (vehicleActiveSession) {
      throw new ConflictException(
        `Vehicle ${createSessionDto.vehicleId} is already parked`,
      );
    }

    const session = this.parkingSessionRepository.create({
      ...createSessionDto,
      entryTime: createSessionDto.entryTime ? new Date(createSessionDto.entryTime) : new Date(),
    });

    return await this.parkingSessionRepository.save(session);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{
    data: ParkingSession[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const findOptions: FindManyOptions<ParkingSession> = {
      skip,
      take: limit,
      order: { entryTime: 'DESC' },
      relations: ['vehicle', 'slot'],
    };

    const [data, total] = await this.parkingSessionRepository.findAndCount(findOptions);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<ParkingSession> {
    const session = await this.parkingSessionRepository.findOne({
      where: { id },
      relations: ['vehicle', 'slot', 'payment'],
    });

    if (!session) {
      throw new NotFoundException(`Parking session with ID ${id} not found`);
    }

    return session;
  }

  async findByVehicle(vehicleId: number): Promise<ParkingSession[]> {
    return await this.parkingSessionRepository.find({
      where: { vehicleId },
      relations: ['vehicle', 'slot', 'payment'],
      order: { entryTime: 'DESC' },
    });
  }

  async findBySlot(slotId: number): Promise<ParkingSession[]> {
    return await this.parkingSessionRepository.find({
      where: { slotId },
      relations: ['vehicle', 'slot', 'payment'],
      order: { entryTime: 'DESC' },
    });
  }

  async findActiveSessions(): Promise<ParkingSession[]> {
    return await this.parkingSessionRepository.find({
      where: { exitTime: IsNull() },
      relations: ['vehicle', 'slot', 'payment'],
      order: { entryTime: 'ASC' },
    });
  }

  async update(id: string, updateSessionDto: UpdateParkingSessionDto): Promise<ParkingSession> {
    const session = await this.findOne(id);

    // If updating exit time, calculate duration
    if (updateSessionDto.exitTime) {
      const exitTime = new Date(updateSessionDto.exitTime);
      const entryTime = new Date(session.entryTime);

      if (exitTime <= entryTime) {
        throw new BadRequestException('Exit time must be after entry time');
      }

      // Calculate duration in minutes
      const durationMs = exitTime.getTime() - entryTime.getTime();
      const durationMinutes = Math.floor(durationMs / (1000 * 60));
      
      updateSessionDto.duration = durationMinutes;
    }

    Object.assign(session, updateSessionDto);
    return await this.parkingSessionRepository.save(session);
  }

  async checkout(id: string, exitTime?: string): Promise<ParkingSession> {
    const session = await this.findOne(id);

    if (session.exitTime) {
      throw new BadRequestException('Session is already checked out');
    }

    const checkoutTime = exitTime ? new Date(exitTime) : new Date();
    const entryTime = new Date(session.entryTime);

    if (checkoutTime <= entryTime) {
      throw new BadRequestException('Exit time must be after entry time');
    }

    // Calculate duration in minutes
    const durationMs = checkoutTime.getTime() - entryTime.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    session.exitTime = checkoutTime;
    session.duration = durationMinutes;

    return await this.parkingSessionRepository.save(session);
  }

  async remove(id: string): Promise<{ message: string }> {
    const session = await this.findOne(id);
    await this.parkingSessionRepository.remove(session);
    return { message: `Parking session with ID ${id} has been deleted successfully` };
  }

  async getSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    totalRevenue: number;
    averageDuration: number;
  }> {
    const [
      totalSessions,
      activeSessions,
      completedSessions,
    ] = await Promise.all([
      this.parkingSessionRepository.count(),
      this.parkingSessionRepository.count({ where: { exitTime: IsNull() } }),
      this.parkingSessionRepository.count({ where: { exitTime: IsNull() } }),
    ]);

    // Calculate total revenue
    const revenueResult = await this.parkingSessionRepository
      .createQueryBuilder('session')
      .select('SUM(session.amountPaid)', 'total')
      .where('session.amountPaid IS NOT NULL')
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult?.total || '0');

    // Calculate average duration
    const durationResult = await this.parkingSessionRepository
      .createQueryBuilder('session')
      .select('AVG(session.duration)', 'average')
      .where('session.duration IS NOT NULL')
      .getRawOne();

    const averageDuration = parseFloat(durationResult?.average || '0');

    return {
      totalSessions,
      activeSessions,
      completedSessions,
      totalRevenue,
      averageDuration,
    };
  }

  async getVehicleSessionHistory(vehicleId: number): Promise<ParkingSession[]> {
    return await this.parkingSessionRepository.find({
      where: { vehicleId },
      relations: ['vehicle', 'slot', 'payment'],
      order: { entryTime: 'DESC' },
    });
  }

  async getSlotSessionHistory(slotId: number): Promise<ParkingSession[]> {
    return await this.parkingSessionRepository.find({
      where: { slotId },
      relations: ['vehicle', 'slot', 'payment'],
      order: { entryTime: 'DESC' },
    });
  }
}
