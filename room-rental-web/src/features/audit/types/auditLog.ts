export type ModelLogEvent = "CREATE" | "UPDATE" | "DELETE" | string;

export interface ModelLogChanges {
  old?: Record<string, unknown> | null;
  new?: Record<string, unknown> | null;
  changed_fields?: string[];
}

export interface ModelLogResponse {
  id: number;
  userId: number;
  userName?: string;
  modelType: string;
  modelId: string;
  event: ModelLogEvent;
  isDifferent?: boolean;
  changes?: ModelLogChanges | null;
  createdAt: string;
}

export interface ModelLogSearchParams {
  userId?: number;
  modelType?: string;
  modelId?: string;
  event?: string;
  /** Only return logs where old/new values actually differ. */
  different?: boolean;
  search?: string;
  from?: string;
  to?: string;
  page?: number;   // 1-indexed UI page
  size?: number;
  sortBy?: string;
  direction?: "asc" | "desc" | string;
}