// src/application/dtos/fetch-task.dto.ts
export interface FetchTaskQuery {
  assigneeId?: string;
  status?: string;
  overdue?: boolean;
  page?: number;
  limit?: number;
}
