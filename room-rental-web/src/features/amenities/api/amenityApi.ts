import { api } from "../../../lib/axios";

import type {
  AmenityResponse,
  AmenitySearchParams,
  CreateAmenityRequest,
  PageResponse,
  UpdateAmenityRequest,
} from "../types/amenity";

export const amenityApi = {
  async getAll(
    params?: AmenitySearchParams,
  ): Promise<PageResponse<AmenityResponse>> {
    const response = await api.get<PageResponse<AmenityResponse>>("/amenities", {
      params,
    });

    return response.data;
  },

  async getByLocationId(
    locationId: number,
    params?: AmenitySearchParams,
  ): Promise<PageResponse<AmenityResponse>> {
    const response = await api.get<PageResponse<AmenityResponse>>(
      `/amenities/location/${locationId}`,
      {
        params,
      },
    );

    return response.data;
  },

  async getById(id: number): Promise<AmenityResponse> {
    const response = await api.get<AmenityResponse>(`/amenities/${id}`);

    return response.data;
  },

  async create(request: CreateAmenityRequest): Promise<AmenityResponse> {
    const response = await api.post<AmenityResponse>("/amenities", request);

    return response.data;
  },

  async update(
    id: number,
    request: UpdateAmenityRequest,
  ): Promise<AmenityResponse> {
    const response = await api.put<AmenityResponse>(
      `/amenities/${id}`,
      request,
    );

    return response.data;
  },

  async deactivate(id: number): Promise<void> {
    await api.delete(`/amenities/${id}`);
  },
};
