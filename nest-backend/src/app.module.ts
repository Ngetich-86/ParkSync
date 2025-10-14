import { MiddlewareConsumer,Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { ResetDbModule } from './database/reset-db.module';
import { HealthModule } from './health-check/health.module';
import { AuthModule } from './auth/auth.module';
import { VehicleModule } from './vehicles/vehicle.module';
import { ParkingSlotModule } from './parking-slot/parking-slot.module';
import { ReservationModule } from './reservations/reservation.module';
import { ParkingSessionModule } from './parking-session/parking-session.module';
import { PaymentsModule } from './payments/payments.module';
import { PaymentModule } from './payment/payment.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerMiddleware } from './logger.middleware';
import { APP_GUARD } from '@nestjs/core';
import { EmailModule } from './notifications/email.module';
import { User } from './users/entities/user.entities';
import { AtGuard } from './auth/guards/at.guards';
import { RolesGuard } from './auth/guards/roles.guards';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';


@Module({
  imports: [
      ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    ResetDbModule,
    CommonModule,
    AuthModule,
    VehicleModule,
    ParkingSlotModule,
    ReservationModule,
    ParkingSessionModule,
    PaymentsModule,
    PaymentModule,
    HealthModule,
    EventEmitterModule.forRoot(),
    EmailModule,
    TypeOrmModule.forFeature([User]), 
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.getOrThrow<number>('THROTTLER_TTL', {
            infer: true,
          }),
          limit: configService.getOrThrow<number>('THROTTLER_LIMIT', {
            infer: true,
          }),
          ignoreUserAgents: [/^curl\//], 
        },
      ],
    }),
   
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
