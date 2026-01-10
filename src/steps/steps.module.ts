import { Module } from '@nestjs/common';
import { StepsController } from './steps.controller';
import { TasksService } from '../tasks/tasks.service';

@Module({
  controllers: [StepsController],
  providers: [TasksService],
})
export class StepsModule {}
