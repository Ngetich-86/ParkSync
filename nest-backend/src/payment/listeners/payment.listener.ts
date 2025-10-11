import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Payment } from '../../payments/entities/payment.entity';
import { PaymentStatus } from '../../common/enums';

export class PaymentCreatedEvent {
  constructor(public payment: Payment) {}
}

export class PaymentVerifiedEvent {
  constructor(public payment: Payment) {}
}

export class PaymentFailedEvent {
  constructor(public payment: Payment, public reason: string) {}
}

export class PaymentRefundedEvent {
  constructor(public payment: Payment, public refundId: string, public amount: number) {}
}

@Injectable()
export class PaymentListener {
  private readonly logger = new Logger(PaymentListener.name);

  @OnEvent('payment.created')
  handlePaymentCreated(event: PaymentCreatedEvent) {
    this.logger.log(`Payment created: ${event.payment.id} - Amount: ${event.payment.amount}`);
    
    // Here you can add additional logic like:
    // - Send confirmation email
    // - Update parking session status
    // - Log to external systems
    // - Send notifications
  }

  @OnEvent('payment.verified')
  handlePaymentVerified(event: PaymentVerifiedEvent) {
    this.logger.log(`Payment verified: ${event.payment.id} - Transaction: ${event.payment.transactionId}`);
    
    // Here you can add logic like:
    // - Update parking session as paid
    // - Send payment confirmation
    // - Update reservation status
    // - Generate receipt
  }

  @OnEvent('payment.failed')
  handlePaymentFailed(event: PaymentFailedEvent) {
    this.logger.warn(`Payment failed: ${event.payment.id} - Reason: ${event.reason}`);
    
    // Here you can add logic like:
    // - Send failure notification
    // - Update parking session status
    // - Retry payment if needed
    // - Log failure for analysis
  }

  @OnEvent('payment.refunded')
  handlePaymentRefunded(event: PaymentRefundedEvent) {
    this.logger.log(`Payment refunded: ${event.payment.id} - Refund ID: ${event.refundId} - Amount: ${event.amount}`);
    
    // Here you can add logic like:
    // - Send refund confirmation
    // - Update parking session status
    // - Process refund in external systems
    // - Update financial records
  }
}
