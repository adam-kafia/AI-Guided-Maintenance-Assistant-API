import { IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class FindAllStepsForTaskDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  taskId: number;
}
