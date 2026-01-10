import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TaskResponseDto } from './dto/taskResponse.dto';
import { CreateTaskDto, IdDto } from './dto/createTask.dto';
import { AiService } from '../ai/ai.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async createTask({
    title,
    vehicleType,
  }: CreateTaskDto): Promise<TaskResponseDto> {
    const generatedSteps = await this.aiService.generateSteps(
      title,
      vehicleType,
    );
    const task = await this.prisma.task.create({
      data: { title, vehicleType, status: 'PENDING' },
    });
    await this.prisma.step.createMany({
      data: generatedSteps.map((step) => ({
        order: step.order,
        title: step.title,
        description: step.description,
        safetyWarning: step.safetyWarning,
        taskId: task.id,
      })),
      skipDuplicates: true,
    });

    return this.toTaskResponseDto(task);
  }
  async getTaskById({ id }: IdDto): Promise<TaskResponseDto> {
    const task = await this.prisma.task.findUnique({ where: { id } });
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
