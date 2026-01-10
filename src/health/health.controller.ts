import { Controller, Get, HttpCode } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get('')
  @HttpCode(200)
  getHealth() {
    return { status: 'ok' };
  }

  @Get('db')
  @HttpCode(200)
  async getDatabaseHealth(): Promise<any> {
    const taskCount = await this.prisma.task.count();
    const res =  taskCount !== undefined
      ? { database: 'connected', taskCount }
      : { database: 'disconnected' };

    return res;
  }
}
