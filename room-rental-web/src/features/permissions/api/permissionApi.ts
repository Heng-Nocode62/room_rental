import { api } from "../../../lib/axios";

import type {
  CreatePermissionRequest,
  UpdatePermissionRequest,
  PermissionResponse,
} from "../types/permission";

export const permissionApi = {
  async create(
    request: CreatePermissionRequest
  ): Promise<PermissionResponse> {
    const response = await api.post<PermissionResponse>(
      "/permissions",
      request
    );

    return response.data;
  },

  async getAll(): Promise<PermissionResponse[]> {
    const response = await api.get<PermissionResponse[]>(
      "/permissions"
    );

    return response.data;
  },

  async getById(id: number): Promise<PermissionResponse> {
    const response = await api.get<PermissionResponse>(
      `/permissions/${id}`
    );

    return response.data;
  },

  async getByModuleId(
    moduleId: number
  ): Promise<PermissionResponse[]> {
    const response = await api.get<PermissionResponse[]>(
      `/permissions/module/${moduleId}`
    );

    return response.data;
  },

  async getByRoleId(
    roleId: number
  ): Promise<PermissionResponse[]> {
    const response = await api.get<PermissionResponse[]>(
      `/permissions/role/${roleId}`
    );

    return response.data;
  },

  async update(
    id: number,
    request: UpdatePermissionRequest
  ): Promise<PermissionResponse> {
    const response = await api.put<PermissionResponse>(
      `/permissions/${id}`,
      request
    );

    return response.data;
  },

  async deactivate(
    id: number
  ): Promise<PermissionResponse> {
    const response = await api.patch<PermissionResponse>(
      `/permissions/${id}/deactivate`
    );

    return response.data;
  },

  async activate(
    id: number
  ): Promise<PermissionResponse> {
    const response = await api.patch<PermissionResponse>(
      `/permissions/${id}/activate`
    );

    return response.data;
  },
};