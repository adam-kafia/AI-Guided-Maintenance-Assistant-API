import { Controller, Get, Param } from '@nestjs/common';
import { StepsService } from './steps.service';
import { GetStepByIdDto } from './dto/getStepById.dto';
import { GetAllStepsResponseDto } from './dto/getAllStepsResponse.dto';
import { IdDto } from '../tasks/dto/createTask.dto';
import { FindAllStepsForTaskDto } from './dto/findAllStepsForTask.dto';

@Controller('steps')
export class StepsController {
  constructor(private stepsService: StepsService) {}

  @Get('init')
  async initSteps() {
    return this.stepsService.initSteps();
  }

  @Get(':id')
  async getStepById(
    @Param() dto: GetStepByIdDto,
  ): Promise<GetAllStepsResponseDto> {
    return this.stepsService.getStepById(dto);
  }
  @Get('task/:taskId')
  async getAllStepsForTask(
    @Param('taskId') dto: FindAllStepsForTaskDto,
  ): Promise<GetAllStepsResponseDto[]> {
    return this.stepsService.findAllStepsForTask(dto);
  }
  @Get('complete/:id')
  async completeStep(@Param() dto: IdDto) {
    return this.stepsService.completeStep(dto);
  }
  @Get('Uncomplete/:id')
  async uncompleteStep(@Param() dto: IdDto) {
    return this.stepsService.uncompleteStep(dto);
  }
}
