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
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { QueryReservationDto } from './dto/query-reservation.dto';
import { CheckoutReservationDto } from './dto/checkout-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import { AtGuard } from '../auth/guards/at.guards';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../users/entities/user.entities';

@ApiTags('Reservations')
@ApiBearerAuth('access-token')
@Controller('reservations')
@UseGuards(AtGuard, RolesGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT)
  @ApiOperation({ summary: 'Create a new reservation' })
  @ApiResponse({
    status: 201,
    description: 'Reservation created successfully',
    type: Reservation,
  })
  @ApiResponse({ status: 409, description: 'Slot already reserved during the time period' })
  @ApiResponse({ status: 400, description: 'Invalid input data or time logic' })
  @ApiResponse({ status: 404, description: 'Vehicle or parking slot not found' })
  create(@Body() createReservationDto: CreateReservationDto): Promise<Reservation> {
    return this.reservationService.create(createReservationDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get all reservations with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of reservations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Reservation' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  findAll(@Query() queryDto: QueryReservationDto) {
    return this.reservationService.findAll(queryDto);
  }

  @Get('active')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT)
  @ApiOperation({ summary: 'Get all active reservations' })
  @ApiResponse({
    status: 200,
    description: 'Active reservations retrieved successfully',
    type: [Reservation],
  })
  findActiveReservations() {
    return this.reservationService.findActiveReservations();
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get reservation statistics' })
  @ApiResponse({
    status: 200,
    description: 'Reservation statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalReservations: { type: 'number' },
        activeReservations: { type: 'number' },
        completedReservations: { type: 'number' },
        cancelledReservations: { type: 'number' },
        expiredReservations: { type: 'number' },
        pendingPayments: { type: 'number' },
        paidReservations: { type: 'number' },
        failedPayments: { type: 'number' },
        totalRevenue: { type: 'number' },
      },
    },
  })
  getStats() {
    return this.reservationService.getReservationStats();
  }

  @Get('vehicle/:vehicleId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get reservations by vehicle ID' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle reservations retrieved successfully',
    type: [Reservation],
  })
  findByVehicle(@Param('vehicleId', ParseIntPipe) vehicleId: number) {
    return this.reservationService.findByVehicle(vehicleId);
  }

  @Get('vehicle/:vehicleId/history')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get vehicle reservation history' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle reservation history retrieved successfully',
    type: [Reservation],
  })
  getVehicleReservationHistory(@Param('vehicleId', ParseIntPipe) vehicleId: number) {
    return this.reservationService.getVehicleReservationHistory(vehicleId);
  }

  @Get('slot/:slotId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT)
  @ApiOperation({ summary: 'Get reservations by parking slot ID' })
  @ApiResponse({
    status: 200,
    description: 'Slot reservations retrieved successfully',
    type: [Reservation],
  })
  findBySlot(@Param('slotId', ParseIntPipe) slotId: number) {
    return this.reservationService.findBySlot(slotId);
  }

  @Get('slot/:slotId/history')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT)
  @ApiOperation({ summary: 'Get parking slot reservation history' })
  @ApiResponse({
    status: 200,
    description: 'Slot reservation history retrieved successfully',
    type: [Reservation],
  })
  getSlotReservationHistory(@Param('slotId', ParseIntPipe) slotId: number) {
    return this.reservationService.getSlotReservationHistory(slotId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get reservation by ID' })
  @ApiResponse({
    status: 200,
    description: 'Reservation found successfully',
    type: Reservation,
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Reservation> {
    return this.reservationService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT)
  @ApiOperation({ summary: 'Update reservation by ID' })
  @ApiResponse({
    status: 200,
    description: 'Reservation updated successfully',
    type: Reservation,
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservationDto: UpdateReservationDto,
  ): Promise<Reservation> {
    return this.reservationService.update(id, updateReservationDto);
  }

  @Patch(':id/checkout')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT)
  @ApiOperation({ summary: 'Checkout a reservation (complete with payment)' })
  @ApiResponse({
    status: 200,
    description: 'Reservation checked out successfully',
    type: Reservation,
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiResponse({ status: 400, description: 'Invalid checkout data or reservation status' })
  checkout(
    @Param('id', ParseIntPipe) id: number,
    @Body() checkoutDto: CheckoutReservationDto,
  ): Promise<Reservation> {
    return this.reservationService.checkout(id, checkoutDto);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Cancel a reservation' })
  @ApiResponse({
    status: 200,
    description: 'Reservation cancelled successfully',
    type: Reservation,
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  @ApiResponse({ status: 400, description: 'Cannot cancel reservation with current status' })
  cancel(@Param('id', ParseIntPipe) id: number): Promise<Reservation> {
    return this.reservationService.cancel(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete reservation by ID' })
  @ApiResponse({
    status: 200,
    description: 'Reservation deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservationService.remove(id);
  }
}

