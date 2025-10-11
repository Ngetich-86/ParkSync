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
import { ParkingSlotService } from './parking-slot.service';
import { CreateParkingSlotDto } from './dto/create-parking-slot.dto';
import { UpdateParkingSlotDto } from './dto/update-parking-slot.dto';
import { QueryParkingSlotDto } from './dto/query-parking-slot.dto';
import { UpdateSlotStatusDto } from './dto/update-slot-status.dto';
import { ParkingSlot, VehicleType } from './entities/parking-slot.entity';
import { AtGuard } from '../auth/guards/at.guards';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../users/entities/user.entities';

@ApiTags('Parking Slots')
@ApiBearerAuth('access-token')
@Controller('parking-slots')
@UseGuards(AtGuard, RolesGuard)
export class ParkingSlotController {
  constructor(private readonly parkingSlotService: ParkingSlotService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new parking slot' })
  @ApiResponse({
    status: 201,
    description: 'Parking slot created successfully',
    type: ParkingSlot,
  })
  @ApiResponse({ status: 409, description: 'Slot number already exists on the floor' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createParkingSlotDto: CreateParkingSlotDto): Promise<ParkingSlot> {
    return this.parkingSlotService.create(createParkingSlotDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get all parking slots with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of parking slots retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ParkingSlot' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  findAll(@Query() queryDto: QueryParkingSlotDto) {
    return this.parkingSlotService.findAll(queryDto);
  }

  @Get('available')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get available parking slots' })
  @ApiResponse({
    status: 200,
    description: 'Available parking slots retrieved successfully',
    type: [ParkingSlot],
  })
  findAvailableSlots(
    @Query('slotType') slotType?: VehicleType,
    @Query('floorId', ParseIntPipe) floorId?: number,
  ) {
    return this.parkingSlotService.findAvailableSlots(slotType, floorId);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get parking slot statistics' })
  @ApiResponse({
    status: 200,
    description: 'Parking slot statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalSlots: { type: 'number' },
        occupiedSlots: { type: 'number' },
        availableSlots: { type: 'number' },
        maintenanceSlots: { type: 'number' },
        twoWheelerSlots: { type: 'number' },
        fourWheelerSlots: { type: 'number' },
        reservedSlots: { type: 'number' },
        publicSlots: { type: 'number' },
      },
    },
  })
  getStats() {
    return this.parkingSlotService.getParkingSlotStats();
  }

  @Get('floor/:floorId/stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT)
  @ApiOperation({ summary: 'Get parking slot statistics for a specific floor' })
  @ApiResponse({
    status: 200,
    description: 'Floor parking slot statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        floorId: { type: 'number' },
        totalSlots: { type: 'number' },
        occupiedSlots: { type: 'number' },
        availableSlots: { type: 'number' },
        maintenanceSlots: { type: 'number' },
        twoWheelerSlots: { type: 'number' },
        fourWheelerSlots: { type: 'number' },
      },
    },
  })
  getFloorStats(@Param('floorId', ParseIntPipe) floorId: number) {
    return this.parkingSlotService.getFloorStats(floorId);
  }

  @Get('floor/:floorId/slot/:slotNumber')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Find parking slot by floor ID and slot number' })
  @ApiResponse({
    status: 200,
    description: 'Parking slot found successfully',
    type: ParkingSlot,
  })
  @ApiResponse({ status: 404, description: 'Parking slot not found' })
  findByFloorAndSlot(
    @Param('floorId', ParseIntPipe) floorId: number,
    @Param('slotNumber') slotNumber: string,
  ) {
    return this.parkingSlotService.findByFloorAndSlot(floorId, slotNumber);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get parking slot by ID' })
  @ApiResponse({
    status: 200,
    description: 'Parking slot found successfully',
    type: ParkingSlot,
  })
  @ApiResponse({ status: 404, description: 'Parking slot not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ParkingSlot> {
    return this.parkingSlotService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update parking slot by ID' })
  @ApiResponse({
    status: 200,
    description: 'Parking slot updated successfully',
    type: ParkingSlot,
  })
  @ApiResponse({ status: 404, description: 'Parking slot not found' })
  @ApiResponse({ status: 409, description: 'Slot number already exists on the floor' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateParkingSlotDto: UpdateParkingSlotDto,
  ): Promise<ParkingSlot> {
    return this.parkingSlotService.update(id, updateParkingSlotDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT)
  @ApiOperation({ summary: 'Update parking slot status (occupied/maintenance)' })
  @ApiResponse({
    status: 200,
    description: 'Parking slot status updated successfully',
    type: ParkingSlot,
  })
  @ApiResponse({ status: 404, description: 'Parking slot not found' })
  @ApiResponse({ status: 400, description: 'Invalid status combination' })
  updateSlotStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateSlotStatusDto,
  ): Promise<ParkingSlot> {
    return this.parkingSlotService.updateSlotStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete parking slot by ID' })
  @ApiResponse({
    status: 200,
    description: 'Parking slot deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Parking slot not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.parkingSlotService.remove(id);
  }
}

