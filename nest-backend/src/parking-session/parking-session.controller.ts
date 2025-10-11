import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ParkingSessionService } from './parking-session.service';
import { CreateParkingSessionDto } from './dto/create-session.dto';
import { UpdateParkingSessionDto } from './dto/update-session.dto';

@ApiTags('Parking Sessions')
@Controller('parking-sessions')
export class ParkingSessionController {
  constructor(private readonly parkingSessionService: ParkingSessionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new parking session' })
  @ApiResponse({ status: 201, description: 'Parking session created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Vehicle or parking slot not found' })
  @ApiResponse({ status: 409, description: 'Slot already occupied or vehicle already parked' })
  async create(@Body() createSessionDto: CreateParkingSessionDto) {
    return await this.parkingSessionService.create(createSessionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all parking sessions with pagination' })
  @ApiResponse({ status: 200, description: 'Parking sessions retrieved successfully' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.parkingSessionService.findAll(page, limit);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active parking sessions' })
  @ApiResponse({ status: 200, description: 'Active parking sessions retrieved successfully' })
  async findActive() {
    return await this.parkingSessionService.findActiveSessions();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get parking session statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats() {
    return await this.parkingSessionService.getSessionStats();
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Get parking sessions by vehicle ID' })
  @ApiResponse({ status: 200, description: 'Vehicle parking sessions retrieved successfully' })
  async findByVehicle(@Param('vehicleId') vehicleId: number) {
    return await this.parkingSessionService.findByVehicle(vehicleId);
  }

  @Get('slot/:slotId')
  @ApiOperation({ summary: 'Get parking sessions by slot ID' })
  @ApiResponse({ status: 200, description: 'Slot parking sessions retrieved successfully' })
  async findBySlot(@Param('slotId') slotId: number) {
    return await this.parkingSessionService.findBySlot(slotId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get parking session by ID' })
  @ApiResponse({ status: 200, description: 'Parking session retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Parking session not found' })
  async findOne(@Param('id') id: string) {
    return await this.parkingSessionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update parking session' })
  @ApiResponse({ status: 200, description: 'Parking session updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Parking session not found' })
  async update(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateParkingSessionDto,
  ) {
    return await this.parkingSessionService.update(id, updateSessionDto);
  }

  @Post(':id/checkout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Checkout parking session' })
  @ApiResponse({ status: 200, description: 'Parking session checked out successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Parking session not found' })
  async checkout(
    @Param('id') id: string,
    @Body('exitTime') exitTime?: string,
  ) {
    return await this.parkingSessionService.checkout(id, exitTime);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete parking session' })
  @ApiResponse({ status: 200, description: 'Parking session deleted successfully' })
  @ApiResponse({ status: 404, description: 'Parking session not found' })
  async remove(@Param('id') id: string) {
    return await this.parkingSessionService.remove(id);
  }
}
