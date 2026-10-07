/**
 * Spring-Data-style page envelope used by the audit list endpoints.
 */
export interface AuditPageResponse<T> {
  content: T[];
  page: number;          // 0-indexed
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty?: boolean;
}