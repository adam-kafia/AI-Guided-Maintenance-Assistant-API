import { Transform } from 'class-transformer';
import { IsNumber, IsNumberString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  vehicleType: string;
}

export class IdDto{
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  id: number;
}