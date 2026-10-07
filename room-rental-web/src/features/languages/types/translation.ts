export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface TranslationResponse {
  id: number;
  languageId: number;
  languageCode: string;
  key: string;
  value: JsonValue;
  active: boolean;
}

export interface UpsertTranslationRequest {
  key: string;
  value: JsonValue;
  active?: boolean;
}

export interface UpsertGlobalTranslationRequest {
  key: string;
  values: Record<string, string>;
}

export interface TranslationSearchParams {
  keyword?: string;
  page?: number;
  perPage?: number;
}

export interface PublicTranslationResponse {
  language: string;
  title: string;
  flag: string | null;
  version: number;
  data: Record<string, JsonValue>;
}

export interface ImportResult {
  message: string;
  imported: number;
  skipped: number;
  languagesMatched: number;
  rowsProcessed: number;
}

