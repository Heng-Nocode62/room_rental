import { api } from "../../../lib/axios";

import type {
  AssignPermissionsRequest,
  CreateRoleRequest,
  RoleResponse,
  UpdateRoleRequest,
} from "../types/role";

export const roleApi = {
  async getAll(): Promise<RoleResponse[]> {
    const response = await api.get<RoleResponse[]>("/roles");

    return response.data;
  },

  async getById(id: number): Promise<RoleResponse> {
    const response = await api.get<RoleResponse>(`/roles/${id}`);

    return response.data;
  },

  async create(request: CreateRoleRequest): Promise<RoleResponse> {
    const response = await api.post<RoleResponse>("/roles", request);

    return response.data;
  },

  async update(id: number, request: UpdateRoleRequest): Promise<RoleResponse> {
    const response = await api.put<RoleResponse>(`/roles/${id}`, request);

    return response.data;
  },

  async assignPermissions(
    id: number,
    request: AssignPermissionsRequest,
  ): Promise<RoleResponse> {
    const response = await api.put<RoleResponse>(
      `/roles/${id}/permissions`,
      request,
    );

    return response.data;
  },

  async deactivate(id: number): Promise<RoleResponse> {
    const response = await api.patch<RoleResponse>(`/roles/${id}/deactivate`);

    return response.data;
  },

  async activate(id: number): Promise<RoleResponse> {
    const response = await api.patch<RoleResponse>(`/roles/${id}/activate`);

    return response.data;
  },
};