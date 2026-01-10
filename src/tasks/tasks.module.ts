import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { AiModule } from '../ai/ai.module';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  imports: [AiModule],
})
export class TasksModule {}
