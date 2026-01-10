export class GetAllStepsResponseDto {
  taskId: number;
  id: number;
  order: number;
  title: string;
  description: string;
  safetyWarning: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
