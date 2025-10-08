import { Controller, Get } from '@nestjs/common';
import { 
  HealthCheck, 
  HealthCheckService, 
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Comprehensive health check' })
  @ApiResponse({ status: 200, description: 'Health check successful' })
  @ApiResponse({ status: 503, description: 'Health check failed' })
  check() {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 10000 }), // 10 second timeout
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      // Skip disk check on Windows to avoid path issues
      ...(process.platform !== 'win32' ? [
        () => this.disk.checkStorage('storage', { 
          path: '/', 
          thresholdPercent: 0.9 
        })
      ] : []),
    ]);
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe - checks if the application is running' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  liveness() {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'Application is alive'
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe - checks if the application is ready to serve traffic' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 10000 }), // 10 second timeout
    ]);
  }

  @Get('database')
  @ApiOperation({ summary: 'Database connectivity check' })
  @ApiResponse({ status: 200, description: 'Database is connected' })
  @ApiResponse({ status: 503, description: 'Database connection failed' })
  async databaseCheck() {
    const startTime = Date.now();
    try {
      // Test database connection with a simple query and timeout
      const queryPromise = this.dataSource.query('SELECT 1');
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout after 15 seconds')), 15000)
      );
      
      await Promise.race([queryPromise, timeoutPromise]);
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        message: 'Database connection is healthy'
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        error: error.message,
        message: 'Database connection failed'
      };
    }
  }

  @Get('info')
  @ApiOperation({ summary: 'Application information' })
  @ApiResponse({ status: 200, description: 'Application info retrieved' })
  info() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      application: {
        name: 'MassNova API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        },
        node: {
          version: process.version,
          platform: process.platform,
          arch: process.arch,
        }
      }
    };
  }

  @Get('config')
  @ApiOperation({ summary: 'Database configuration check (for debugging)' })
  @ApiResponse({ status: 200, description: 'Configuration info retrieved' })
  config() {
    const databaseUrl = process.env.DATABASE_URL;
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        url_configured: !!databaseUrl,
        url_preview: databaseUrl ? 
          `${databaseUrl.split('@')[0].split('://')[0]}://***@${databaseUrl.split('@')[1]}` : 
          'Not configured',
        ssl_mode: databaseUrl?.includes('sslmode=require') ? 'required' : 'not specified',
        connection_type: databaseUrl ? 'Neon (DATABASE_URL)' : 'Individual variables'
      },
      environment: {
        node_env: process.env.NODE_ENV || 'development',
        port: process.env.PORT || '5000'
      }
    };
  }
}