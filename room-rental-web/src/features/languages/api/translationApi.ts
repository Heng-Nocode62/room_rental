import { coreApi } from "../../../lib/axios";
import type {
  ImportResult,
  PublicTranslationResponse,
  TranslationResponse,
  TranslationSearchParams,
  UpsertGlobalTranslationRequest,
  UpsertTranslationRequest,
} from "../types/translation";
import type { BackendPageResponse } from "../types/api";

export const translationApi = {
  async list(
    languageId: number,
    params: TranslationSearchParams = {},
  ): Promise<BackendPageResponse<TranslationResponse>> {
    const response = await coreApi.get<BackendPageResponse<TranslationResponse>>(
      `/language/${languageId}/translation`,
      {
        params: {
          keyword: params.keyword || undefined,
          page: Math.max((params.page ?? 1) - 1, 0),
          perPage: params.perPage ?? 50,
        },
      },
    );
    return response.data;
  },

  async upsert(
    languageId: number,
    request: UpsertTranslationRequest,
  ): Promise<TranslationResponse> {
    const response = await coreApi.post<TranslationResponse>(
      `/language/${languageId}/translation`,
      request,
    );
    return response.data;
  },

  async toggle(translationId: number): Promise<TranslationResponse> {
    const response = await coreApi.patch<TranslationResponse>(
      `/translation/${translationId}/toggle`,
    );
    return response.data;
  },

  async upsertGlobal(request: UpsertGlobalTranslationRequest): Promise<{ message: string }> {
    const response = await coreApi.post<{ message: string }>("/translation/global", request);
    return response.data;
  },

  async deleteById(translationId: number): Promise<void> {
    await coreApi.delete(`/translation/${translationId}`);
  },

  async deleteByKey(key: string): Promise<void> {
    await coreApi.delete("/translation/by-key", { params: { key } });
  },

  async import(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await coreApi.post<ImportResult>("/translation/import", formData);
    return response.data;
  },

  async export(languageIds?: number[]): Promise<Blob> {
    const query = new URLSearchParams();

    // Spring Long[] expects repeated `languages` parameters:
    // ?languages=1&languages=2
    for (const id of languageIds ?? []) {
      query.append("languages", String(id));
    }

    const response = await coreApi.get("/translation/export", {
      params: query,
      responseType: "blob",
    });

    return response.data;
  },

  async getTranslate(languageCode: string): Promise<PublicTranslationResponse> {
    const response = await coreApi.get<PublicTranslationResponse>(
      `/translate/${encodeURIComponent(languageCode)}`,
    );
    return response.data;
  },

  async getAllTranslate(): Promise<Record<string, PublicTranslationResponse>> {
    const response = await coreApi.get<{
      data: Record<string, PublicTranslationResponse>;
    }>("/translate");
    return response.data.data;
  },

  async getTranslationVersion(
    languageCode: string,
  ): Promise<{ language: string; version: number }> {
    const response = await coreApi.get<{ language: string; version: number }>(
      `/translate/${encodeURIComponent(languageCode)}/version`,
    );
    return response.data;
  },
};
