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