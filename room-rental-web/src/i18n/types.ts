export interface BackendTranslation {
  id: number;
  languageId: number;
  languageCode: string;
  key: string;
  value: string;
  active: boolean;
}

export interface RuntimeTranslationResponse {
  data?: BackendTranslation[] | Record<string, string>;

  translations?: Record<string, string>;

  languageCode?: string;

  version?: string | number;
}

export type RuntimeTranslations =
  Record<string, string>;

export interface RuntimeVersionResponse {
  data?: string | number;
  version?: string | number;
}

// Types required by features/translation/api.ts
export interface Language {
  id: number;
  code: string;
  title: string;
  flag?: string;
  active: boolean;
}

export interface PageResponse<T> {
  data: T[];
  meta: {
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
  };
}

export interface Translation {
  id: number;
  languageId: number;
  key: string;
  value: unknown;
  active: boolean;
}

export interface TranslationMatrixRow {
  key: string;
  values: Record<number, unknown>;
}