import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './users/entities/user.entities';
import { Vehicle } from './vehicles/entities/vehicle.entity';
import { ParkingSlot } from './parking-slot/entities/parking-slot.entity';
import { Reservation } from './reservations/entities/reservation.entity';

// Load environment variables
config({
  path: ['.env', '.env.prod', '.env.local'],
});

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [User, Vehicle, ParkingSlot, Reservation],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // Always false for migrations
  logging: true,
  ssl: { rejectUnauthorized: false },
  // Connection timeout settings for Neon
  connectTimeoutMS: 30000,
  // Connection pool settings
  extra: {
    max: 10,
    min: 1,
    acquire: 30000,
    idle: 10000,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 10000,
  },
});
