// src/features/room-blocks/api/roomBlockApi.ts

import { api } from "../../../lib/axios";

import type {
  CreateRoomBlockRequest,
  RoomBlockResponse,
  RoomBlockSearchParams,
} from "../types/roomBlock";

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

export const roomBlockApi = {

  async search(
    params: RoomBlockSearchParams
  ): Promise<
    PageResponse<RoomBlockResponse>
  > {
    const response =
      await api.get<
        PageResponse<RoomBlockResponse>
      >(
        "/room-blocks",
        {
          params: {
            keyword:
              params.keyword,

            roomId:
              params.roomId,

            locationId:
              params.locationId,

            blockType:
              params.blockType,

            status:
              params.status,

            date:
              params.date,

            fromDate:
              params.fromDate,

            toDate:
              params.toDate,

            page:
              params.page ?? 0,

            size:
              params.size ?? 20,

            sort:
              params.sort ??
              "startAt,desc",
          },
        }
      );

    return response.data;
  },


  async getById(
    id: number
  ): Promise<RoomBlockResponse> {
    const response =
      await api.get<RoomBlockResponse>(
        `/room-blocks/${id}`
      );

    return response.data;
  },


  async getByRoom(
    roomId: number
  ): Promise<RoomBlockResponse[]> {
    const response =
      await api.get<RoomBlockResponse[]>(
        `/room-blocks/room/${roomId}`
      );

    return response.data;
  },


  async create(
    request: CreateRoomBlockRequest
  ): Promise<RoomBlockResponse> {
    const response =
      await api.post<RoomBlockResponse>(
        "/room-blocks",
        request
      );

    return response.data;
  },


  async complete(
    id: number
  ): Promise<RoomBlockResponse> {
    const response =
      await api.post<RoomBlockResponse>(
        `/room-blocks/${id}/complete`
      );

    return response.data;
  },


  async cancel(
    id: number
  ): Promise<RoomBlockResponse> {
    const response =
      await api.post<RoomBlockResponse>(
        `/room-blocks/${id}/cancel`
      );

    return response.data;
  },
};