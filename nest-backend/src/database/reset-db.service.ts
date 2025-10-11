import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResetDbService implements OnModuleInit {
  private readonly logger = new Logger(ResetDbService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('ResetDbService initialized');
  }

  /**
   * Drop all tables in the database
   */
  async dropAllTables(): Promise<{ message: string; droppedTables: string[] }> {
    try {
      this.logger.warn('Starting database reset - dropping all tables...');
      
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // Get all table names
      const tables = await queryRunner.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%'
        AND tablename != 'migrations'
      `);

      const tableNames = tables.map((table: any) => table.tablename);
      this.logger.log(`Found ${tableNames.length} tables to drop: ${tableNames.join(', ')}`);

      // Drop all tables
      for (const tableName of tableNames) {
        await queryRunner.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
        this.logger.log(`Dropped table: ${tableName}`);
      }

      // Drop all sequences
      const sequences = await queryRunner.query(`
        SELECT sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'
      `);

      for (const sequence of sequences) {
        await queryRunner.query(`DROP SEQUENCE IF EXISTS "${sequence.sequencename}" CASCADE`);
        this.logger.log(`Dropped sequence: ${sequence.sequencename}`);
      }

      // Drop all enums
      const enums = await queryRunner.query(`
        SELECT t.typname 
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname NOT LIKE 'pg_%'
        GROUP BY t.typname
      `);

      for (const enumType of enums) {
        await queryRunner.query(`DROP TYPE IF EXISTS "${enumType.typname}" CASCADE`);
        this.logger.log(`Dropped enum: ${enumType.typname}`);
      }

      await queryRunner.release();

      this.logger.warn('Database reset completed successfully');
      return {
        message: 'All tables, sequences, and enums dropped successfully',
        droppedTables: tableNames,
      };
    } catch (error) {
      this.logger.error('Error dropping tables:', error);
      throw new Error(`Failed to drop tables: ${error.message}`);
    }
  }

  /**
   * Run all migrations from scratch
   */
  async runMigrations(): Promise<{ message: string; migrations: string[] }> {
    try {
      this.logger.log('Running migrations...');

      // Check if migrations table exists, if not create it
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      const migrationsTableExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'migrations'
        );
      `);

      if (!migrationsTableExists[0].exists) {
        await queryRunner.query(`
          CREATE TABLE "migrations" (
            "id" SERIAL NOT NULL,
            "timestamp" bigint NOT NULL,
            "name" character varying NOT NULL,
            CONSTRAINT "PK_8c82d7f5260ab31c3edc1a7a7e7" PRIMARY KEY ("id")
          )
        `);
        this.logger.log('Created migrations table');
      }

      await queryRunner.release();

      // Run migrations
      const migrations = await this.dataSource.runMigrations();
      
      this.logger.log(`Successfully ran ${migrations.length} migrations`);
      return {
        message: `Successfully ran ${migrations.length} migrations`,
        migrations: migrations.map(m => m.name),
      };
    } catch (error) {
      this.logger.error('Error running migrations:', error);
      throw new Error(`Failed to run migrations: ${error.message}`);
    }
  }

  /**
   * Reset database completely - drop all tables and run migrations
   */
  async resetDatabase(confirmReset: boolean = false): Promise<{
    message: string;
    droppedTables: string[];
    migrations: string[];
  }> {
    if (!confirmReset) {
      throw new Error('Database reset requires confirmation. Set confirmReset to true.');
    }

    this.logger.warn('Starting complete database reset...');

    // Step 1: Drop all tables
    const dropResult = await this.dropAllTables();

    // Step 2: Run migrations
    const migrationResult = await this.runMigrations();

    this.logger.warn('Complete database reset finished successfully');

    return {
      message: 'Database reset completed successfully',
      droppedTables: dropResult.droppedTables,
      migrations: migrationResult.migrations,
    };
  }

  /**
   * Get database status and information
   */
  async getDatabaseStatus(): Promise<{
    tables: string[];
    sequences: string[];
    enums: string[];
    migrations: any[];
  }> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // Get tables
      const tables = await queryRunner.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%'
      `);

      // Get sequences
      const sequences = await queryRunner.query(`
        SELECT sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'
      `);

      // Get enums
      const enums = await queryRunner.query(`
        SELECT t.typname 
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname NOT LIKE 'pg_%'
        GROUP BY t.typname
      `);

      // Get migrations
      let migrations = [];
      try {
        migrations = await queryRunner.query(`
          SELECT * FROM migrations ORDER BY timestamp
        `);
      } catch (error) {
        this.logger.log('Migrations table does not exist yet');
      }

      await queryRunner.release();

      return {
        tables: tables.map((t: any) => t.tablename),
        sequences: sequences.map((s: any) => s.sequencename),
        enums: enums.map((e: any) => e.typname),
        migrations: migrations,
      };
    } catch (error) {
      this.logger.error('Error getting database status:', error);
      throw new Error(`Failed to get database status: ${error.message}`);
    }
  }

  /**
   * Check if database is empty (no tables except migrations)
   */
  async isDatabaseEmpty(): Promise<boolean> {
    try {
      const status = await this.getDatabaseStatus();
      return status.tables.length === 0 || 
             (status.tables.length === 1 && status.tables.includes('migrations'));
    } catch (error) {
      this.logger.error('Error checking if database is empty:', error);
      return false;
    }
  }
}
