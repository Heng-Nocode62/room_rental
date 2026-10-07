export interface LanguageResponse {
  id: number;
  code: string;
  title: string;
  flag: string | null;
  active: boolean;
  translationCount: number;
}

export interface CreateLanguageRequest {
  code: string;
  title: string;
  flag?: string | null;
  active?: boolean;
}

export interface UpdateLanguageRequest {
  code: string;
  title: string;
  flag?: string | null;
  active?: boolean;
}

export interface LanguageSearchParams {
  keyword?: string;
  isActive?: boolean;
  page?: number; // 1-based in the UI; API is converted to 0-based
  perPage?: number;
  sortBy?: "id" | "code" | "title" | "createdAt" | "updatedAt" | "translationVersion" | string;
  sortDirection?: "asc" | "desc" | string;
}
