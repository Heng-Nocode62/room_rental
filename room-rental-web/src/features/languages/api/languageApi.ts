import { coreApi } from "../../../lib/axios";
import type {
  LanguageResponse,
  LanguageSearchParams,
  CreateLanguageRequest,
  UpdateLanguageRequest,
} from "../types/language";
import type { BackendPageResponse } from "../types/api";

export const languageApi = {
  async search(params: LanguageSearchParams = {}): Promise<BackendPageResponse<LanguageResponse>> {
    const response = await coreApi.get<BackendPageResponse<LanguageResponse>>("/language", {
      params: {
        keyword: params.keyword || undefined,
        isActive: params.isActive,
        // React UI is 1-based, Spring Pageable is 0-based.
        page: Math.max((params.page ?? 1) - 1, 0),
        perPage: params.perPage ?? 20,
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
      },
    });
    return response.data;
  },

  async active(): Promise<LanguageResponse[]> {
    const response = await coreApi.get<{ data: LanguageResponse[] }>("/language/active");
    return response.data.data;
  },

  async create(request: CreateLanguageRequest): Promise<LanguageResponse> {
    const response = await coreApi.post<LanguageResponse>("/language", request);
    return response.data;
  },

  async update(id: number, request: UpdateLanguageRequest): Promise<LanguageResponse> {
    const response = await coreApi.put<LanguageResponse>(`/language/${id}`, request);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await coreApi.delete(`/language/${id}`);
  },

  async toggle(id: number): Promise<LanguageResponse> {
    const response = await coreApi.patch<LanguageResponse>(`/language/${id}/toggle`);
    return response.data;
  },
};
