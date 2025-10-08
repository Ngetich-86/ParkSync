import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    // Check if license plate already exists
    const existingVehicle = await this.vehicleRepository.findOne({
      where: { licensePlate: createVehicleDto.licensePlate },
    });

    if (existingVehicle) {
      throw new ConflictException(
        `Vehicle with license plate ${createVehicleDto.licensePlate} already exists`,
      );
    }

    const vehicle = this.vehicleRepository.create(createVehicleDto);
    return await this.vehicleRepository.save(vehicle);
  }

  async findAll(queryDto: QueryVehicleDto): Promise<{
    data: Vehicle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, ...filters } = queryDto;
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: any = {};
    
    if (filters.licensePlate) {
      where.licensePlate = Like(`%${filters.licensePlate}%`);
    }
    
    if (filters.vehicleType) {
      where.vehicleType = filters.vehicleType;
    }
    
    if (filters.ownerName) {
      where.ownerName = Like(`%${filters.ownerName}%`);
    }
    
    if (filters.ownerEmail) {
      where.ownerEmail = Like(`%${filters.ownerEmail}%`);
    }

    const findOptions: FindManyOptions<Vehicle> = {
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    };

    const [data, total] = await this.vehicleRepository.findAndCount(findOptions);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { vehicleId: id },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return vehicle;
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { licensePlate },
    });

    if (!vehicle) {
      throw new NotFoundException(
        `Vehicle with license plate ${licensePlate} not found`,
      );
    }

    return vehicle;
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findOne(id);

    // Check if license plate is being updated and if it already exists
    if (
      updateVehicleDto.licensePlate &&
      updateVehicleDto.licensePlate !== vehicle.licensePlate
    ) {
      const existingVehicle = await this.vehicleRepository.findOne({
        where: { licensePlate: updateVehicleDto.licensePlate },
      });

      if (existingVehicle) {
        throw new ConflictException(
          `Vehicle with license plate ${updateVehicleDto.licensePlate} already exists`,
        );
      }
    }

    Object.assign(vehicle, updateVehicleDto);
    return await this.vehicleRepository.save(vehicle);
  }

  async remove(id: number): Promise<{ message: string }> {
    const vehicle = await this.findOne(id);
    await this.vehicleRepository.remove(vehicle);
    return { message: `Vehicle with ID ${id} has been deleted successfully` };
  }

  async getVehicleStats(): Promise<{
    totalVehicles: number;
    twoWheelers: number;
    fourWheelers: number;
    vehiclesWithOwners: number;
  }> {
    const [totalVehicles, twoWheelers, fourWheelers, vehiclesWithOwners] =
      await Promise.all([
        this.vehicleRepository.count(),
        this.vehicleRepository.count({
          where: { vehicleType: 'TWO_WHEELER' },
        }),
        this.vehicleRepository.count({
          where: { vehicleType: 'FOUR_WHEELER' },
        }),
        this.vehicleRepository.count({
          where: { ownerName: Like('%') },
        }),
      ]);

    return {
      totalVehicles,
      twoWheelers,
      fourWheelers,
      vehiclesWithOwners,
    };
  }
}
