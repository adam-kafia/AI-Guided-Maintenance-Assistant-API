import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, IdDto } from './dto/createTask.dto';
import { TaskResponseDto } from './dto/taskResponse.dto';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}
  @Post()
  async createTask(@Body() dto: CreateTaskDto): Promise<TaskResponseDto> {
    const task: TaskResponseDto = await this.tasksService.createTask(dto);
    return task;
  }
  @Get(':id')
  async getTaskById(@Param() dto: IdDto): Promise<TaskResponseDto> {
    const task: TaskResponseDto = await this.tasksService.getTaskById(dto);
    return task;
  }
}
