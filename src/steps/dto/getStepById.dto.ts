import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetStepByIdDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  id: number;
}
