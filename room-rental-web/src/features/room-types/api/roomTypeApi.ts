import { api } from "../../../lib/axios";

import type {
  CreateRoomTypeRequest,
  RoomTypeResponse,
  UpdateRoomTypeRequest,
} from "../types/roomType";

export const roomTypeApi = {
  async getAll(): Promise<RoomTypeResponse[]> {
    const response = await api.get<RoomTypeResponse[]>("/room-types");

    return response.data;
  },

  async getById(id: number): Promise<RoomTypeResponse> {
    const response = await api.get<RoomTypeResponse>(
      `/room-types/${id}`,
    );

    return response.data;
  },

  async create(
    request: CreateRoomTypeRequest,
  ): Promise<RoomTypeResponse> {
    const response = await api.post<RoomTypeResponse>(
      "/room-types",
      request,
    );

    return response.data;
  },

  async update(
    id: number,
    request: UpdateRoomTypeRequest,
  ): Promise<RoomTypeResponse> {
    const response = await api.put<RoomTypeResponse>(
      `/room-types/${id}`,
      request,
    );

    return response.data;
  },

  async updateImage(
    id: number,
    image: File,
  ): Promise<RoomTypeResponse> {
    const formData = new FormData();

    formData.append("image", image);

    const response = await api.put<RoomTypeResponse>(
      `/room-types/${id}/image`,
      formData,
    );

    return response.data;
  },

  async deactivate(id: number): Promise<void> {
    await api.delete(`/room-types/${id}`);
  },
};