export interface ActivityLogResponse {
  id: number;
  userId: number | null;
  method: string;
  /** Full request URL, e.g. /api/v1/audit/activity-logs */
  url: string;
  requestData?: unknown;
  responseData?: unknown;
  ip?: string | null;
  userAgent?: string | null;
  responseStatus: number;
  createdAt: string;
}

export interface ActivityLogSearchParams {
  userId?: number;
  method?: string;
  responseStatus?: number;
  search?: string;
  /** ISO-8601 datetime with offset */
  from?: string;
  to?: string;
  /** 1-indexed UI page (converted to 0-indexed in the API layer) */
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "asc" | "desc" | string;
}