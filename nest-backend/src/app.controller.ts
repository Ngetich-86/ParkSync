import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { readFile } from 'fs/promises';
import { Public } from './auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
@ApiTags('API Status')
export class AppController {
  @Get('/')
  @Public()
  @ApiOperation({ summary: 'API root endpoint' })
  @ApiResponse({ status: 200, description: 'API is running' })
  async getApiStatus(@Res() res: Response) {
    try {
      // Try to serve static file first
      const html = await readFile('./public/index.html', 'utf-8');
      res.type('html').send(html);
    } catch (err) {
      // Fallback to JSON response if no static file
      const apiStatus = {
        status: 'ok',
        message: 'MassNova API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: {
          health: '/health',
          docs: '/api/docs',
          live: '/health/live',
          ready: '/health/ready'
        }
      };
      res.json(apiStatus);
    }
  }

  @Get('/api')
  @Public()
  @ApiOperation({ summary: 'API information' })
  @ApiResponse({ status: 200, description: 'API information retrieved' })
  getApiInfo() {
    return {
      status: 'ok',
      message: 'MassNova API',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        health: {
          main: '/health',
          live: '/health/live',
          ready: '/health/ready',
          database: '/health/database',
          info: '/health/info'
        },
        documentation: '/api/docs'
      }
    };
  }
}
