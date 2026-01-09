import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TaskResponseDto } from './dto/taskResponse.dto';
import { CreateTaskDto, IdDto } from './dto/createTask.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async createTask({title, vehicleType}: CreateTaskDto):Promise<TaskResponseDto> {
    const task = await this.prisma.task.create({data: { title, vehicleType , status: 'PENDING'}});
    return this.toTaskResponseDto(task);
  }
  async getTaskById({id}:IdDto): Promise<TaskResponseDto> {
    const task =  await this.prisma.task.findUnique({where: {id}});
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return this.toTaskResponseDto(task);
  }
  toTaskResponseDto(task: Task): TaskResponseDto {
    const { id, title, vehicleType, status, createdAt, updatedAt } = task;
    return { id, title, vehicleType, status, createdAt, updatedAt };

  }
}
