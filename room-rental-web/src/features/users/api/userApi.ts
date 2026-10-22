// src/features/users/api/userApi.ts

import { api } from "../../../lib/axios";

import type {
  AssignRolesRequest,
  ChangePasswordRequest,
  CreateUserRequest,
  ResetPasswordRequest,
  UpdateUserRequest,
  UserResponse,
  UserSearchParams,
} from "../types/user";

export interface PageResponse<T> {
  content: T[];

  page: number;
  size: number;

  totalElements: number;
  totalPages: number;

  first: boolean;
  last: boolean;

  empty: boolean;
}

export const userApi = {
  async search(params: UserSearchParams): Promise<PageResponse<UserResponse>> {
    const response = await api.get<PageResponse<UserResponse>>("/users", {
      params: {
        keyword: params.keyword,

        status: params.status,

        roleId: params.roleId,

        page: params.page ?? 0,

        size: params.size ?? 20,

        sort: params.sort ?? "username,asc",
      },
    });

    return response.data;
  },

  async getById(id: number): Promise<UserResponse> {
    const response = await api.get<UserResponse>(`/users/${id}`);

    return response.data;
  },

  async create(request: CreateUserRequest): Promise<UserResponse> {
    const response = await api.post<UserResponse>("/users", request);

    return response.data;
  },

  async update(id: number, request: UpdateUserRequest): Promise<UserResponse> {
    const response = await api.put<UserResponse>(`/users/${id}`, request);

    return response.data;
  },

  async assignRoles(
    id: number,
    request: AssignRolesRequest,
  ): Promise<UserResponse> {
    const response = await api.put<UserResponse>(`/users/${id}/roles`, request);

    return response.data;
  },

  async changePassword(
    id: number,
    request: ChangePasswordRequest,
  ): Promise<void> {
    await api.put(`/users/${id}/password`, request);
  },

  async resetPassword(
    id: number,
    request: ResetPasswordRequest,
  ): Promise<void> {
    await api.put(`/users/${id}/password/reset`, request);
  },

  async lock(id: number): Promise<void> {
    await api.post(`/users/${id}/lock`);
  },

  async unlock(id: number): Promise<void> {
    await api.post(`/users/${id}/unlock`);
  },

  async deactivate(id: number): Promise<void> {
    await api.post(`/users/${id}/deactivate`);
  },
};
