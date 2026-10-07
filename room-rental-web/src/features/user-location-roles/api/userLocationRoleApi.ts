import { api } from "../../../lib/axios";
import type {
  UserLocationRoleRequest,
  UserLocationRoleResponse,
} from "../types/userLocationRole";

export const userLocationRoleApi = {
  async getByUserId(userId: number): Promise<UserLocationRoleResponse[]> {
    const response = await api.get<UserLocationRoleResponse[]>(
      `/user-location-roles/user/${userId}`,
    );
    return response.data;
  },

  async getByLocationId(locationId: number): Promise<UserLocationRoleResponse[]> {
    const response = await api.get<UserLocationRoleResponse[]>(
      `/user-location-roles/location/${locationId}`,
    );
    return response.data;
  },

  async create(request: UserLocationRoleRequest): Promise<UserLocationRoleResponse> {
    const response = await api.post<UserLocationRoleResponse>(
      "/user-location-roles",
      request,
    );
    return response.data;
  },

  async update(
    id: number,
    request: UserLocationRoleRequest,
  ): Promise<UserLocationRoleResponse> {
    const response = await api.put<UserLocationRoleResponse>(
      `/user-location-roles/${id}`,
      request,
    );
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/user-location-roles/${id}`);
  },
};
