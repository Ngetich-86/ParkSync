import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { AtGuard } from '../auth/guards/at.guards';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../users/entities/user.entities';
import { PaymentStatus } from '../common/enums';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(AtGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  @ApiOperation({ 
    summary: 'Create a new payment order',
    description: 'Creates a Razorpay payment order for parking payments'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Payment order created successfully',
    schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string', example: 'order_1234567890' },
        amount: { type: 'number', example: 150.50 },
        currency: { type: 'string', example: 'INR' },
        key: { type: 'string', example: 'rzp_test_1234567890' },
        name: { type: 'string', example: 'ParkSync' },
        description: { type: 'string', example: 'Parking Payment' },
        prefill: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            contact: { type: 'string', example: '+919876543210' }
          }
        },
        notes: { type: 'object' },
        theme: {
          type: 'object',
          properties: {
            color: { type: 'string', example: '#3399cc' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.MANAGER)
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.paymentService.createPayment(createPaymentDto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verify payment after successful transaction',
    description: 'Verifies the payment signature and updates payment status'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Payment verified successfully',
    type: 'object'
  })
  @ApiResponse({ status: 400, description: 'Payment verification failed' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.MANAGER)
  async verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return await this.paymentService.verifyPayment(verifyPaymentDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all payments with pagination',
    description: 'Retrieves paginated list of all payments'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ 
    status: 200, 
    description: 'Payments retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Payment' } },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 10 }
      }
    }
  })
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT)
  async getAllPayments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.paymentService.getAllPayments(page, limit);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get payment statistics',
    description: 'Retrieves payment statistics and analytics'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Payment statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalPayments: { type: 'number', example: 1000 },
        successfulPayments: { type: 'number', example: 950 },
        pendingPayments: { type: 'number', example: 30 },
        failedPayments: { type: 'number', example: 20 },
        totalAmount: { type: 'number', example: 150000.50 },
        totalRefunded: { type: 'number', example: 5000.00 }
      }
    }
  })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getPaymentStats() {
    return await this.paymentService.getPaymentStats();
  }

  @Get('status/:status')
  @ApiOperation({ 
    summary: 'Get payments by status',
    description: 'Retrieves payments filtered by status'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Payments retrieved successfully',
    type: 'array'
  })
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT)
  async getPaymentsByStatus(@Param('status') status: PaymentStatus) {
    return await this.paymentService.getPaymentsByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get payment by ID',
    description: 'Retrieves a specific payment by its ID'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Payment retrieved successfully',
    type: 'object'
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT)
  async getPaymentById(@Param('id') id: string) {
    return await this.paymentService.getPaymentById(id);
  }

  @Get('transaction/:transactionId')
  @ApiOperation({ 
    summary: 'Get payment by transaction ID',
    description: 'Retrieves a payment by its Razorpay transaction ID'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Payment retrieved successfully',
    type: 'object'
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANT)
  async getPaymentByTransactionId(@Param('transactionId') transactionId: string) {
    return await this.paymentService.getPaymentByTransactionId(transactionId);
  }

  @Post('refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Refund a payment',
    description: 'Processes a refund for a successful payment'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Refund processed successfully',
    schema: {
      type: 'object',
      properties: {
        refundId: { type: 'string', example: 'rfnd_1234567890' },
        amount: { type: 'number', example: 150.50 },
        status: { type: 'string', example: 'processed' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Refund failed' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async refundPayment(@Body() refundPaymentDto: RefundPaymentDto) {
    return await this.paymentService.refundPayment(refundPaymentDto);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Razorpay webhook endpoint',
    description: 'Handles Razorpay webhook events for payment status updates'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook processed successfully' 
  })
  @ApiResponse({ status: 400, description: 'Webhook processing failed' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() payload: any,
  ) {
    const signature = req.headers['x-razorpay-signature'] as string;
    return await this.paymentService.handleWebhook(payload, signature);
  }
}
