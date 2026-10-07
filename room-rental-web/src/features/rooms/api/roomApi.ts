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
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort ?? "roomNumber,asc",
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

  async deactivate(id: number): Promise<void> {
    await api.delete(`/rooms/${id}`);
  },

  async getAmenities(roomId: number): Promise<RoomAmenityResponse[]> {
    const response = await api.get<RoomAmenityResponse[]>(
      `/rooms/${roomId}/amenities`,
    );
    return response.data;
  },

  async addAmenity(
    roomId: number,
    request: RoomAmenityRequest,
  ): Promise<void> {
    await api.post(`/rooms/${roomId}/amenities`, request);
  },

  async removeAmenity(roomId: number, amenityId: number): Promise<void> {
    await api.delete(`/rooms/${roomId}/amenities/${amenityId}`);
  },
};
