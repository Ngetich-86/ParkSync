#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ResetDbService } from './reset-db.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('ResetDbCLI');
  
  try {
    logger.log('Starting database reset CLI...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const resetDbService = app.get(ResetDbService);

    const command = process.argv[2];
    const confirmReset = process.argv[3] === '--confirm';

    switch (command) {
      case 'status':
        logger.log('Getting database status...');
        const status = await resetDbService.getDatabaseStatus();
        console.log('\n📊 Database Status:');
        console.log('==================');
        console.log(`Tables: ${status.tables.length}`);
        status.tables.forEach(table => console.log(`  - ${table}`));
        console.log(`\nSequences: ${status.sequences.length}`);
        status.sequences.forEach(seq => console.log(`  - ${seq}`));
        console.log(`\nEnums: ${status.enums.length}`);
        status.enums.forEach(enumType => console.log(`  - ${enumType}`));
        console.log(`\nMigrations: ${status.migrations.length}`);
        status.migrations.forEach(migration => console.log(`  - ${migration.name} (${new Date(parseInt(migration.timestamp)).toISOString()})`));
        break;

      case 'drop':
        if (!confirmReset) {
          logger.error('❌ Drop command requires --confirm flag');
          logger.error('Usage: npm run reset-db drop --confirm');
          process.exit(1);
        }
        logger.warn('⚠️  Dropping all tables...');
        const dropResult = await resetDbService.dropAllTables();
        logger.log(`✅ Dropped ${dropResult.droppedTables.length} tables`);
        break;

      case 'migrate':
        logger.log('🔄 Running migrations...');
        const migrateResult = await resetDbService.runMigrations();
        logger.log(`✅ Ran ${migrateResult.migrations.length} migrations`);
        break;

      case 'reset':
        if (!confirmReset) {
          logger.error('❌ Reset command requires --confirm flag');
          logger.error('Usage: npm run reset-db reset --confirm');
          process.exit(1);
        }
        logger.warn('⚠️  Resetting entire database...');
        const resetResult = await resetDbService.resetDatabase(true);
        logger.log(`✅ Reset completed:`);
        logger.log(`   - Dropped ${resetResult.droppedTables.length} tables`);
        logger.log(`   - Ran ${resetResult.migrations.length} migrations`);
        break;

      case 'fresh':
        logger.warn('⚠️  Fresh reset (auto-confirmed)...');
        const freshResult = await resetDbService.resetDatabase(true);
        logger.log(`✅ Fresh reset completed:`);
        logger.log(`   - Dropped ${freshResult.droppedTables.length} tables`);
        logger.log(`   - Ran ${freshResult.migrations.length} migrations`);
        break;

      default:
        console.log('\n🗄️  Database Reset CLI');
        console.log('=====================');
        console.log('Available commands:');
        console.log('  status              - Show database status');
        console.log('  drop --confirm      - Drop all tables');
        console.log('  migrate             - Run migrations');
        console.log('  reset --confirm     - Reset database (drop + migrate)');
        console.log('  fresh               - Fresh reset (auto-confirmed)');
        console.log('\nExamples:');
        console.log('  npm run reset-db status');
        console.log('  npm run reset-db fresh');
        console.log('  npm run reset-db reset --confirm');
        break;
    }

    await app.close();
    logger.log('✅ CLI completed successfully');
    
  } catch (error) {
    logger.error('❌ CLI failed:', error.message);
    process.exit(1);
  }
}

bootstrap();
