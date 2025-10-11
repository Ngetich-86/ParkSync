import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ResetDbService } from './reset-db.service';
import { AtGuard } from '../auth/guards/at.guards';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../users/entities/user.entities';

export class ResetDatabaseDto {
  confirmReset: boolean;
}

export class DatabaseStatusResponse {
  tables: string[];
  sequences: string[];
  enums: string[];
  migrations: any[];
  isEmpty: boolean;
}

@ApiTags('Database Management')
@Controller('database')
@UseGuards(AtGuard, RolesGuard)
@ApiBearerAuth()
export class ResetDbController {
  constructor(private readonly resetDbService: ResetDbService) {}

  @Get('status')
  @ApiOperation({ 
    summary: 'Get database status',
    description: 'Get information about current database tables, sequences, enums, and migrations'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Database status retrieved successfully',
    type: DatabaseStatusResponse
  })
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async getDatabaseStatus(): Promise<DatabaseStatusResponse> {
    const status = await this.resetDbService.getDatabaseStatus();
    const isEmpty = await this.resetDbService.isDatabaseEmpty();
    
    return {
      ...status,
      isEmpty,
    };
  }

  @Post('drop-tables')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Drop all database tables',
    description: '⚠️ DANGER: This will drop ALL tables, sequences, and enums in the database'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'All tables dropped successfully' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Failed to drop tables' 
  })
  @Roles(UserRole.SUPERADMIN)
  async dropAllTables() {
    try {
      return await this.resetDbService.dropAllTables();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('run-migrations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Run database migrations',
    description: 'Run all pending migrations to create/update database schema'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Migrations completed successfully' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Failed to run migrations' 
  })
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  async runMigrations() {
    try {
      return await this.resetDbService.runMigrations();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reset entire database',
    description: '⚠️ DANGER: This will drop ALL tables and run fresh migrations. Requires confirmation.'
  })
  @ApiBody({ 
    type: ResetDatabaseDto,
    description: 'Confirmation object to proceed with database reset'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Database reset completed successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Reset requires confirmation or failed to reset' 
  })
  @Roles(UserRole.SUPERADMIN)
  async resetDatabase(@Body() resetDto: ResetDatabaseDto) {
    if (!resetDto.confirmReset) {
      throw new BadRequestException('Database reset requires confirmation. Set confirmReset to true.');
    }

    try {
      return await this.resetDbService.resetDatabase(true);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('reset-fresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reset database with fresh migrations (convenience endpoint)',
    description: '⚠️ DANGER: Convenience endpoint that automatically confirms reset. Drops all tables and runs fresh migrations.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Database reset with fresh migrations completed successfully' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Failed to reset database' 
  })
  @Roles(UserRole.SUPERADMIN)
  async resetDatabaseFresh() {
    try {
      return await this.resetDbService.resetDatabase(true);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
