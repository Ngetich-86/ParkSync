import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions } from 'typeorm';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { PaymentStatus } from '../common/enums';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { QueryReservationDto } from './dto/query-reservation.dto';
import { CheckoutReservationDto } from './dto/checkout-reservation.dto';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { ParkingSlot } from '../parking-slot/entities/parking-slot.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(ParkingSlot)
    private parkingSlotRepository: Repository<ParkingSlot>,
  ) {}

  async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    // Validate vehicle exists
    const vehicle = await this.vehicleRepository.findOne({
      where: { vehicleId: createReservationDto.vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException(
        `Vehicle with ID ${createReservationDto.vehicleId} not found`,
      );
    }

    // Validate parking slot exists
    const parkingSlot = await this.parkingSlotRepository.findOne({
      where: { parkingSlotId: createReservationDto.slotId },
    });

    if (!parkingSlot) {
      throw new NotFoundException(
        `Parking slot with ID ${createReservationDto.slotId} not found`,
      );
    }

    // Check if slot is available during the requested time
    const conflictingReservation = await this.reservationRepository.findOne({
      where: {
        slotId: createReservationDto.slotId,
        status: ReservationStatus.ACTIVE,
      },
    });

    if (conflictingReservation) {
      const startTime = new Date(createReservationDto.startTime);
      const endTime = new Date(createReservationDto.endTime);
      const conflictStart = new Date(conflictingReservation.startTime);
      const conflictEnd = new Date(conflictingReservation.endTime);

      // Check for time overlap
      if (
        (startTime >= conflictStart && startTime < conflictEnd) ||
        (endTime > conflictStart && endTime <= conflictEnd) ||
        (startTime <= conflictStart && endTime >= conflictEnd)
      ) {
        throw new ConflictException(
          `Parking slot ${createReservationDto.slotId} is already reserved during the requested time period`,
        );
      }
    }

    // Validate time logic
    const startTime = new Date(createReservationDto.startTime);
    const endTime = new Date(createReservationDto.endTime);
    const entryTime = new Date(createReservationDto.entryTime);

    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (entryTime < startTime) {
      throw new BadRequestException('Entry time cannot be before start time');
    }

    if (createReservationDto.exitTime) {
      const exitTime = new Date(createReservationDto.exitTime);
      if (exitTime <= entryTime) {
        throw new BadRequestException('Exit time must be after entry time');
      }
    }

    const reservation = this.reservationRepository.create(createReservationDto);
    return await this.reservationRepository.save(reservation);
  }

  async findAll(queryDto: QueryReservationDto): Promise<{
    data: Reservation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, ...filters } = queryDto;
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: any = {};

    if (filters.vehicleId) {
      where.vehicleId = filters.vehicleId;
    }

    if (filters.slotId) {
      where.slotId = filters.slotId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters.startDateFrom || filters.startDateTo) {
      where.startTime = {};
      if (filters.startDateFrom) {
        where.startTime = Between(
          new Date(filters.startDateFrom),
          filters.startDateTo ? new Date(filters.startDateTo) : new Date(),
        );
      } else if (filters.startDateTo) {
        where.startTime = Between(
          new Date('1900-01-01'),
          new Date(filters.startDateTo),
        );
      }
    }

    if (filters.endDateFrom || filters.endDateTo) {
      where.endTime = {};
      if (filters.endDateFrom) {
        where.endTime = Between(
          new Date(filters.endDateFrom),
          filters.endDateTo ? new Date(filters.endDateTo) : new Date(),
        );
      } else if (filters.endDateTo) {
        where.endTime = Between(
          new Date('1900-01-01'),
          new Date(filters.endDateTo),
        );
      }
    }

    const findOptions: FindManyOptions<Reservation> = {
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['vehicle', 'parkingSlot'],
    };

    const [data, total] = await this.reservationRepository.findAndCount(findOptions);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['vehicle', 'parkingSlot'],
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return reservation;
  }

  async findByVehicle(vehicleId: number): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      where: { vehicleId },
      relations: ['vehicle', 'parkingSlot'],
      order: { createdAt: 'DESC' },
    });
  }

  async findBySlot(slotId: number): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      where: { slotId },
      relations: ['vehicle', 'parkingSlot'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveReservations(): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      where: { status: ReservationStatus.ACTIVE },
      relations: ['vehicle', 'parkingSlot'],
      order: { startTime: 'ASC' },
    });
  }

  async update(id: number, updateReservationDto: UpdateReservationDto): Promise<Reservation> {
    const reservation = await this.findOne(id);

    // If updating times, validate them
    if (updateReservationDto.startTime || updateReservationDto.endTime) {
      const startTime = new Date(updateReservationDto.startTime || reservation.startTime);
      const endTime = new Date(updateReservationDto.endTime || reservation.endTime);

      if (startTime >= endTime) {
        throw new BadRequestException('Start time must be before end time');
      }
    }

    Object.assign(reservation, updateReservationDto);
    return await this.reservationRepository.save(reservation);
  }

  async checkout(id: number, checkoutDto: CheckoutReservationDto): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot checkout reservation with status ${reservation.status}`,
      );
    }

    const exitTime = new Date(checkoutDto.exitTime);
    const entryTime = new Date(reservation.entryTime);

    if (exitTime <= entryTime) {
      throw new BadRequestException('Exit time must be after entry time');
    }

    reservation.exitTime = exitTime;
    reservation.totalAmount = checkoutDto.totalAmount;
    reservation.paymentStatus = checkoutDto.paymentStatus;
    reservation.status = ReservationStatus.COMPLETED;

    return await this.reservationRepository.save(reservation);
  }

  async cancel(id: number): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot cancel reservation with status ${reservation.status}`,
      );
    }

    reservation.status = ReservationStatus.CANCELLED;
    return await this.reservationRepository.save(reservation);
  }

  async remove(id: number): Promise<{ message: string }> {
    const reservation = await this.findOne(id);
    await this.reservationRepository.remove(reservation);
    return { message: `Reservation with ID ${id} has been deleted successfully` };
  }

  async getReservationStats(): Promise<{
    totalReservations: number;
    activeReservations: number;
    completedReservations: number;
    cancelledReservations: number;
    expiredReservations: number;
    pendingPayments: number;
    paidReservations: number;
    failedPayments: number;
    totalRevenue: number;
  }> {
    const [
      totalReservations,
      activeReservations,
      completedReservations,
      cancelledReservations,
      expiredReservations,
      pendingPayments,
      paidReservations,
      failedPayments,
    ] = await Promise.all([
      this.reservationRepository.count(),
      this.reservationRepository.count({ where: { status: ReservationStatus.ACTIVE } }),
      this.reservationRepository.count({ where: { status: ReservationStatus.COMPLETED } }),
      this.reservationRepository.count({ where: { status: ReservationStatus.CANCELLED } }),
      this.reservationRepository.count({ where: { status: ReservationStatus.EXPIRED } }),
      this.reservationRepository.count({ where: { paymentStatus: PaymentStatus.PENDING } }),
      this.reservationRepository.count({ where: { paymentStatus: PaymentStatus.SUCCESS } }),
      this.reservationRepository.count({ where: { paymentStatus: PaymentStatus.FAILED } }),
    ]);

    // Calculate total revenue from completed and paid reservations
    const revenueResult = await this.reservationRepository
      .createQueryBuilder('reservation')
      .select('SUM(reservation.totalAmount)', 'total')
      .where('reservation.status = :status', { status: ReservationStatus.COMPLETED })
      .andWhere('reservation.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.SUCCESS })
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult?.total || '0');

    return {
      totalReservations,
      activeReservations,
      completedReservations,
      cancelledReservations,
      expiredReservations,
      pendingPayments,
      paidReservations,
      failedPayments,
      totalRevenue,
    };
  }

  async getVehicleReservationHistory(vehicleId: number): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      where: { vehicleId },
      relations: ['vehicle', 'parkingSlot'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSlotReservationHistory(slotId: number): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      where: { slotId },
      relations: ['vehicle', 'parkingSlot'],
      order: { createdAt: 'DESC' },
    });
  }
}

