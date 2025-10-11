import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResetDbService } from './reset-db.service';
import { ResetDbController } from './reset-db.controller';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/entities/user.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Add User entity for RolesGuard
    AuthModule, // Import auth module for guards
  ],
  controllers: [ResetDbController],
  providers: [ResetDbService],
  exports: [ResetDbService],
})
export class ResetDbModule {}
