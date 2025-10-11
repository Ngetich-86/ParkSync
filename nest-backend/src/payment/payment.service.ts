import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
const Razorpay = require('razorpay');
import { Payment } from '../payments/entities/payment.entity';
import { PaymentStatus } from '../common/enums';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentCreatedEvent, PaymentVerifiedEvent, PaymentFailedEvent, PaymentRefundedEvent } from './events/payment.events';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private razorpay: any;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    // Initialize Razorpay with test credentials
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
    });
  }

  /**
   * Create a new payment order
   */
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    key: string;
    name: string;
    description: string;
    prefill: {
      name: string;
      email: string;
      contact: string;
    };
    notes: Record<string, any>;
    theme: {
      color: string;
    };
  }> {
    try {
      const { amount, currency = 'INR', customerName, customerEmail, customerPhone, notes = {} } = createPaymentDto;

      // Create Razorpay order
      const orderOptions = {
        amount: Math.round(amount * 100), // Convert to paise
        currency: currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          ...notes,
          customerName,
          customerEmail,
          customerPhone,
        },
      };

      const order = await this.razorpay.orders.create(orderOptions);

      // Create payment record in database
      const payment = this.paymentRepository.create({
        amount,
        status: PaymentStatus.PENDING,
        transactionId: order.id,
        paymentMethod: 'razorpay',
        notes: JSON.stringify(notes),
      });

      await this.paymentRepository.save(payment);

      // Emit payment created event
      this.eventEmitter.emit('payment.created', new PaymentCreatedEvent(payment));

      this.logger.log(`Payment order created: ${order.id}`);

      return {
        orderId: order.id,
        amount: amount,
        currency: currency,
        key: this.configService.get<string>('RAZORPAY_KEY_ID') || '',
        name: 'ParkSync',
        description: 'Parking Payment',
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        notes: {
          ...notes,
          paymentId: payment.id,
        },
        theme: {
          color: '#3399cc',
        },
      };
    } catch (error) {
      this.logger.error('Error creating payment:', error);
      throw new BadRequestException('Failed to create payment order');
    }
  }

  /**
   * Verify payment after successful transaction
   */
  async verifyPayment(verifyPaymentDto: VerifyPaymentDto): Promise<Payment> {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = verifyPaymentDto;

      // Find payment by transaction ID (order ID)
      const payment = await this.paymentRepository.findOne({
        where: { transactionId: razorpayOrderId },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // Verify signature
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.configService.get<string>('RAZORPAY_KEY_SECRET'))
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        this.logger.error('Payment signature verification failed');
        payment.status = PaymentStatus.FAILED;
        payment.notes = JSON.stringify({
          ...JSON.parse(payment.notes || '{}'),
          error: 'Signature verification failed',
          razorpayPaymentId,
        });
        await this.paymentRepository.save(payment);
        
        // Emit payment failed event
        this.eventEmitter.emit('payment.failed', new PaymentFailedEvent(payment, 'Signature verification failed'));
        
        throw new BadRequestException('Payment verification failed');
      }

      // Update payment status
      payment.status = PaymentStatus.SUCCESS;
      payment.transactionId = razorpayPaymentId; // Update with actual payment ID
      payment.notes = JSON.stringify({
        ...JSON.parse(payment.notes || '{}'),
        razorpayOrderId,
        razorpayPaymentId,
        verifiedAt: new Date().toISOString(),
      });

      await this.paymentRepository.save(payment);

      // Emit payment verified event
      this.eventEmitter.emit('payment.verified', new PaymentVerifiedEvent(payment));

      this.logger.log(`Payment verified successfully: ${razorpayPaymentId}`);

      return payment;
    } catch (error) {
      this.logger.error('Error verifying payment:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to verify payment');
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  /**
   * Get payment by transaction ID
   */
  async getPaymentByTransactionId(transactionId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  /**
   * Get all payments with pagination
   */
  async getAllPayments(page: number = 1, limit: number = 10): Promise<{
    data: Payment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.paymentRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get payments by status
   */
  async getPaymentsByStatus(status: PaymentStatus): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Refund payment
   */
  async refundPayment(refundPaymentDto: RefundPaymentDto): Promise<{
    refundId: string;
    amount: number;
    status: string;
  }> {
    try {
      const { paymentId, amount, reason = 'Customer requested refund' } = refundPaymentDto;

      // Get payment details
      const payment = await this.getPaymentById(paymentId);

      if (payment.status !== PaymentStatus.SUCCESS) {
        throw new BadRequestException('Only successful payments can be refunded');
      }

      // Create refund with Razorpay
      const refundOptions = {
        payment_id: payment.transactionId,
        amount: Math.round((amount || payment.amount) * 100), // Convert to paise
        notes: {
          reason,
          refundedAt: new Date().toISOString(),
        },
      };

      const refund = await this.razorpay.payments.refund(payment.transactionId, refundOptions);

      // Update payment status
      payment.status = PaymentStatus.FAILED; // Mark as failed for refunded payments
      payment.notes = JSON.stringify({
        ...JSON.parse(payment.notes || '{}'),
        refundId: refund.id,
        refundAmount: amount || payment.amount,
        refundReason: reason,
        refundedAt: new Date().toISOString(),
      });

      await this.paymentRepository.save(payment);

      // Emit payment refunded event
      this.eventEmitter.emit('payment.refunded', new PaymentRefundedEvent(payment, refund.id, amount || payment.amount));

      this.logger.log(`Payment refunded successfully: ${refund.id}`);

      return {
        refundId: refund.id,
        amount: amount || payment.amount,
        status: refund.status,
      };
    } catch (error) {
      this.logger.error('Error refunding payment:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to process refund');
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(): Promise<{
    totalPayments: number;
    successfulPayments: number;
    pendingPayments: number;
    failedPayments: number;
    totalAmount: number;
    totalRefunded: number;
  }> {
    const [
      totalPayments,
      successfulPayments,
      pendingPayments,
      failedPayments,
    ] = await Promise.all([
      this.paymentRepository.count(),
      this.paymentRepository.count({ where: { status: PaymentStatus.SUCCESS } }),
      this.paymentRepository.count({ where: { status: PaymentStatus.PENDING } }),
      this.paymentRepository.count({ where: { status: PaymentStatus.FAILED } }),
    ]);

    // Calculate total amount from successful payments
    const totalAmountResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .getRawOne();

    const totalAmount = parseFloat(totalAmountResult?.total || '0');

    // Calculate total refunded amount
    const refundedResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(CAST(JSON_EXTRACT(payment.notes, "$.refundAmount") AS DECIMAL))', 'total')
      .where('payment.status = :status', { status: PaymentStatus.FAILED })
      .andWhere('JSON_EXTRACT(payment.notes, "$.refundId") IS NOT NULL')
      .getRawOne();

    const totalRefunded = parseFloat(refundedResult?.total || '0');

    return {
      totalPayments,
      successfulPayments,
      pendingPayments,
      failedPayments,
      totalAmount,
      totalRefunded,
    };
  }

  /**
   * Webhook handler for Razorpay events
   */
  async handleWebhook(payload: any, signature: string): Promise<void> {
    try {
      // Verify webhook signature
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET'))
        .update(JSON.stringify(payload))
        .digest('hex');

      if (expectedSignature !== signature) {
        this.logger.error('Webhook signature verification failed');
        throw new BadRequestException('Invalid webhook signature');
      }

      const event = payload.event;
      const paymentData = payload.payload.payment?.entity;

      if (event === 'payment.captured') {
        // Handle successful payment
        const payment = await this.paymentRepository.findOne({
          where: { transactionId: paymentData.id },
        });

        if (payment) {
          payment.status = PaymentStatus.SUCCESS;
          payment.notes = JSON.stringify({
            ...JSON.parse(payment.notes || '{}'),
            webhookProcessed: true,
            processedAt: new Date().toISOString(),
          });
          await this.paymentRepository.save(payment);
        }
      } else if (event === 'payment.failed') {
        // Handle failed payment
        const payment = await this.paymentRepository.findOne({
          where: { transactionId: paymentData.id },
        });

        if (payment) {
          payment.status = PaymentStatus.FAILED;
          payment.notes = JSON.stringify({
            ...JSON.parse(payment.notes || '{}'),
            webhookProcessed: true,
            failureReason: paymentData.error_description,
            processedAt: new Date().toISOString(),
          });
          await this.paymentRepository.save(payment);
        }
      }

      this.logger.log(`Webhook processed successfully: ${event}`);
    } catch (error) {
      this.logger.error('Error processing webhook:', error);
      throw new BadRequestException('Webhook processing failed');
    }
  }
}
