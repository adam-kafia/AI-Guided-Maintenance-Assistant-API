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
    const stepCount = await this.prisma.step.count();
    const res =  stepCount !== undefined
      ? { database: 'connected', stepCount }
      : { database: 'disconnected' };

    return res;
  }
}
