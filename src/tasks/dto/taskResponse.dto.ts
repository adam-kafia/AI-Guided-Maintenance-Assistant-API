export class TaskResponseDto {
  id: number;
  title: string;
  vehicleType?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
