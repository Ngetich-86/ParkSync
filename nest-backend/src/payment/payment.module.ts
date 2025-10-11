import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentListener } from './listeners/payment.listener';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    AuthModule, // Import auth module for guards
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentListener],
  exports: [PaymentService],
})
export class PaymentModule {}
