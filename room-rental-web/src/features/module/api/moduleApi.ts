import { api } from "../../../lib/axios";

import type {
  CreateModuleRequest,
  ModuleResponse,
  UpdateModuleRequest,
} from "../types/module";

export const moduleApi = {
  async getAll(): Promise<ModuleResponse[]> {
    const response = await api.get<ModuleResponse[]>(
      "/modules",
    );

    return response.data;
  },

  async getById(id: number): Promise<ModuleResponse> {
    const response = await api.get<ModuleResponse>(
      `/modules/${id}`,
    );

    return response.data;
  },

  async create(
    request: CreateModuleRequest,
  ): Promise<ModuleResponse> {
    const response = await api.post<ModuleResponse>(
      "/modules",
      request,
    );

    return response.data;
  },

  async update(
    id: number,
    request: UpdateModuleRequest,
  ): Promise<ModuleResponse> {
    const response = await api.put<ModuleResponse>(
      `/modules/${id}`,
      request,
    );

    return response.data;
  },

  async deactivate(id: number): Promise<ModuleResponse> {
    const response = await api.patch<ModuleResponse>(
      `/modules/${id}/deactivate`,
    );

    return response.data;
  },

  async activate(id: number): Promise<ModuleResponse> {
    const response = await api.patch<ModuleResponse>(
      `/modules/${id}/activate`,
    );

    return response.data;
  },
};