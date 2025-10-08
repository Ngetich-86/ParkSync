import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';
import { AtGuard } from '../auth/guards/at.guards';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../users/entities/user.entities';

@ApiTags('Vehicles')
@ApiBearerAuth('access-token')
@Controller('vehicles')
@UseGuards(AtGuard, RolesGuard)
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT)
  @ApiOperation({ summary: 'Create a new vehicle' })
  @ApiResponse({
    status: 201,
    description: 'Vehicle created successfully',
    type: Vehicle,
  })
  @ApiResponse({ status: 409, description: 'License plate already exists' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    return this.vehicleService.create(createVehicleDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get all vehicles with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of vehicles retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Vehicle' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  findAll(@Query() queryDto: QueryVehicleDto) {
    return this.vehicleService.findAll(queryDto);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get vehicle statistics' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalVehicles: { type: 'number' },
        twoWheelers: { type: 'number' },
        fourWheelers: { type: 'number' },
        vehiclesWithOwners: { type: 'number' },
      },
    },
  })
  getStats() {
    return this.vehicleService.getVehicleStats();
  }

  @Get('license/:licensePlate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Find vehicle by license plate' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle found successfully',
    type: Vehicle,
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  findByLicensePlate(@Param('licensePlate') licensePlate: string) {
    return this.vehicleService.findByLicensePlate(licensePlate);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle found successfully',
    type: Vehicle,
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Vehicle> {
    return this.vehicleService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT)
  @ApiOperation({ summary: 'Update vehicle by ID' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle updated successfully',
    type: Vehicle,
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 409, description: 'License plate already exists' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    return this.vehicleService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete vehicle by ID' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vehicleService.remove(id);
  }
}
