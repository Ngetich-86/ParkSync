import { Payment } from '../../payments/entities/payment.entity';

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
