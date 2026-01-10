import { IsNumber } from 'class-validator';

export class FindAllStepsForTaskDto {
  @IsNumber()
  taskId: number;
}
