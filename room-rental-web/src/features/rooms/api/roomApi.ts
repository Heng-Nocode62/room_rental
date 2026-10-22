import { api } from "../../../lib/axios";

import type {
  CreateRoomRequest,
  PageResponse,
  RoomAmenityRequest,
  RoomAmenityResponse,
  RoomResponse,
  RoomSearchParams,
  UpdateRoomRequest,
} from "../types/room";

export const roomApi = {
  async search(params: RoomSearchParams): Promise<PageResponse<RoomResponse>> {
    const response = await api.get<PageResponse<RoomResponse>>("/rooms", {
      params: {
        keyword: params.keyword,
        locationId: params.locationId,
        roomTypeId: params.roomTypeId,
        status: params.status,
        minCapacity: params.minCapacity,
        maxCapacity: params.maxCapacity,
        amenityId: params.amenityId,
        amenityIds: params.amenityIds,
        floors: params.floors,
        minHourlyPrice: params.minHourlyPrice,
        maxHourlyPrice: params.maxHourlyPrice,
        effectiveDate: params.effectiveDate,
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort ?? "roomNumber,asc",
      },
      // Spring List<> request parameters require repeated keys, e.g.
      // amenityIds=1&amenityIds=2 (not amenityIds[]=1).
      paramsSerializer: {
        serialize: (queryParams) => {
          const query = new URLSearchParams();

          Object.entries(queryParams as Record<string, unknown>).forEach(
            ([key, value]) => {
              if (value === undefined || value === null || value === "") {
                return;
              }

              if (Array.isArray(value)) {
                value.forEach((item) => {
                  if (item !== undefined && item !== null && item !== "") {
                    query.append(key, String(item));
                  }
                });
                return;
              }

              query.append(key, String(value));
            },
          );

          return query.toString();
        },
      },
    });

    return response.data;
  },

  async getById(id: number): Promise<RoomResponse> {
    const response = await api.get<RoomResponse>(`/rooms/${id}`);
    return response.data;
  },

  async create(request: CreateRoomRequest): Promise<RoomResponse> {
    const response = await api.post<RoomResponse>("/rooms", request);
    return response.data;
  },

  async update(id: number, request: UpdateRoomRequest): Promise<RoomResponse> {
    const response = await api.put<RoomResponse>(`/rooms/${id}`, request);
    return response.data;
  },

  async updateImage(id: number, image: File): Promise<RoomResponse> {
    const formData = new FormData();
    formData.append("image", image);

    const response = await api.put<RoomResponse>(
      `/rooms/${id}/image`,
      formData,
    );
    return response.data;
  },

  async deactivate(id: number): Promise<void> {
    await api.delete(`/rooms/${id}`);
  },

  async getAmenities(roomId: number): Promise<RoomAmenityResponse[]> {
    const response = await api.get<RoomAmenityResponse[]>(
      `/rooms/${roomId}/amenities`,
    );
    return response.data;
  },

  async addAmenity(roomId: number, request: RoomAmenityRequest): Promise<void> {
    await api.post(`/rooms/${roomId}/amenities`, request);
  },

  async removeAmenity(
    roomId: number,
    amenityId: number,
    amount?: number,
  ): Promise<void> {
    await api.delete(`/rooms/${roomId}/amenities/${amenityId}`, {
      params: amount !== undefined ? { amount } : undefined,
    });
  },
};
