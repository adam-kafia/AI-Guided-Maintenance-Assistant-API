import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindAllStepsForTaskDto } from './dto/findAllStepsForTask.dto';
import { GetStepByIdDto } from './dto/getStepById.dto';
import { Step } from '../generated/prisma/client';
import { GetAllStepsResponseDto } from './dto/getAllStepsResponse.dto';

@Injectable()
export class StepsService {
  constructor(private prisma: PrismaService) {}

  async initSteps() {
    const steps = await this.prisma.step.createMany({
      data: [
        {
          id: 1,
          taskId: 1,
          order: 1,
          title: 'Inspect the equipment',
          description: 'Check for any visible damage or wear.',
          safetyWarning: null,
        },
        {
          id: 2,
          taskId: 1,
          order: 2,
          title: 'Power off the equipment',
          description: 'Ensure the equipment is completely powered down.',
          safetyWarning: 'Risk of electric shock. Use insulated gloves.',
        },
      ],
      skipDuplicates: true,
    });
    console.log(`Initialized ${steps.count} steps`);
  }

  async findAllStepsForTask({
    taskId,
  }: FindAllStepsForTaskDto): Promise<GetAllStepsResponseDto[]> {
    const steps = await this.prisma.step.findMany({ where: { taskId } });
    return steps.map((step) => this.toResponseGetAllStepsDto(step));
  }
  async getStepById({ id }: GetStepByIdDto) {
    const step = await this.prisma.step.findUnique({ where: { id } });
    if (!step) {
      throw new NotFoundException(`Step with id ${id} not found`);
    }
    return this.toResponseGetAllStepsDto(step);
  }
  async completeStep({ id }: GetStepByIdDto) {
    const findStep = await this.prisma.step.findUnique({ where: { id } });
    if (!findStep) {
      throw new NotFoundException(`Step with id ${id} not found`);
    }
    if (findStep.completedAt) {
      throw new ConflictException(`Step with id ${id} is already completed`);
    }

    const complete = await this.prisma.step.update({
      where: { id },
      data: { completedAt: new Date() },
    });
    if (await this.checkAllStepsCompleted(complete.taskId)) {
      await this.prisma.task.update({
        where: { id: complete.taskId },
        data: { status: 'COMPLETED' },
      });
    }
    return complete;
  }

  async uncompleteStep({ id }: GetStepByIdDto) {
    const findStep = await this.prisma.step.findUnique({ where: { id } });
    if (!findStep) {
      throw new NotFoundException(`Step with id ${id} not found`);
    }
    if (findStep.completedAt === null) {
      throw new ConflictException(`Step with id ${id} is already uncompleted`);
    }
    const uncomplete = await this.prisma.step.update({
      where: { id },
      data: { completedAt: null },
    });
    const task = await this.prisma.task.findUnique({
      where: { id: uncomplete.taskId },
    });
    if (task?.status === 'COMPLETED') {
      await this.prisma.task.update({
        where: { id: uncomplete.taskId },
        data: { status: 'STEPS_GENERATED' },
      });
    }
    return uncomplete;
  }
  async checkAllStepsCompleted(taskId: number) {
    const steps = await this.findAllStepsForTask({ taskId });
    const completed = steps.every((step) => step.completedAt !== null);
    return completed;
  }

  toResponseGetAllStepsDto(step: Step): GetAllStepsResponseDto {
    const {
      taskId,
      id,
      order,
      title,
      description,
      safetyWarning,
      completedAt,
      createdAt,
      updatedAt,
    } = step;
    return {
      taskId,
      id,
      order,
      title,
      description,
      safetyWarning,
      completedAt,
      createdAt,
      updatedAt,
    };
  }
}
