

import { api } from "../../../lib/axios";

import type {
  CreateLocationRequest,
  LocationResponse,
  UpdateLocationRequest,
} from "../types/location";

export const locationApi = {

  async getAll(): Promise<LocationResponse[]> {
    const response =
      await api.get<LocationResponse[]>(
        "/locations"
      );

    return response.data;
  },

  async getById(
    id: number
  ): Promise<LocationResponse> {
    const response =
      await api.get<LocationResponse>(
        `/locations/${id}`
      );

    return response.data;
  },

  async create(
    request: CreateLocationRequest
  ): Promise<LocationResponse> {
    const response =
      await api.post<LocationResponse>(
        "/locations",
        request
      );

    return response.data;
  },

  async update(
    id: number,
    request: UpdateLocationRequest
  ): Promise<LocationResponse> {
    const response =
      await api.put<LocationResponse>(
        `/locations/${id}`,
        request
      );

    return response.data;
  },

  async deactivate(
    id: number
  ): Promise<void> {
    await api.delete(
      `/locations/${id}`
    );
  },
};