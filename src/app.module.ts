import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import { StepsModule } from './steps/steps.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TasksModule,
    StepsModule,
    HealthModule,
    PrismaModule,
    AiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
