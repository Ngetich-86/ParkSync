import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load Environment Variables
config({
  path: ['.env', '.env.prod', '.env.local'],
});

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not defined');
}
const sql = neon(process.env.DATABASE_URL!);

const dbProvider = {
  provide: 'POSTGRES_POOL',
  useValue: sql,
};

@Module({
    imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Prioritize DATABASE_URL for Neon, fallback to individual variables
        const databaseUrl = configService.get<string>('DATABASE_URL');
        
        if (databaseUrl) {
          // Use DATABASE_URL for Neon
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: configService.get<boolean>('DB_SYNC', true),
            logging: configService.get<boolean>('DB_LOGGING', false),
            ssl: { rejectUnauthorized: false },
            migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
            autoLoadEntities: true,
            // Connection timeout settings for Neon
            connectTimeoutMS: 30000, // 30 seconds
            acquireTimeoutMillis: 30000, // 30 seconds
            timeout: 30000, // 30 seconds
            // Connection pool settings
            extra: {
              max: 10, // Maximum number of connections
              min: 1,  // Minimum number of connections
              acquire: 30000, // Maximum time to wait for a connection
              idle: 10000,    // Maximum idle time for a connection
              // Neon-specific settings
              connectionTimeoutMillis: 30000,
              idleTimeoutMillis: 10000,
            },
          };
        } else {
          // Fallback to individual variables for local development
          return {
            type: 'postgres',
            host: configService.get<string>('DB_HOST', 'localhost'),
            port: configService.get<number>('DB_PORT', 5432),
            username: configService.get<string>('DB_USERNAME', 'postgres'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_NAME', 'parksync_db'),
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: configService.get<boolean>('DB_SYNC', true),
            logging: configService.get<boolean>('DB_LOGGING', false),
            ssl: false, // No SSL needed for local development
            migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
            autoLoadEntities: true,
          };
        }
      },
      inject: [ConfigService], 
    }),
  ],
  providers: [dbProvider],
  exports: [dbProvider],
})
export class DatabaseModule {}