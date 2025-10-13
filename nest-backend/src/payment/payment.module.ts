import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentListener } from './listeners/payment.listener';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/entities/user.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, User]), // Add User entity for RolesGuard
    AuthModule, // Import auth module for guards
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentListener],
  exports: [PaymentService],
})
export class PaymentModule {}
