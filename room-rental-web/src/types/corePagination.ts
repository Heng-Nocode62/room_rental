/**
 * Search params accepted by the core (unversioned `/api/...`) list endpoints,
 * e.g. `GET /language` and `GET /language/{language}/translation`.
 */
export interface CoreSearchParams {
  keyword?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc" | string;
}

/**
 * Response envelope for core list endpoints. Field names are inferred from the
 * `page` / `perPage` request params (the API contract does not include a
 * response example) and can be adjusted here if the backend differs.
 */
export interface CorePageResponse<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}
