
import { api } from "../../../lib/axios";

import type {
  CreateRoomPriceRequest,
  RoomPriceResponse,
  RoomPriceSearchParams,
  UpdateRoomPriceRequest,
} from "../types/roomPrice";

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

export const roomPriceApi = {

  async search(
    params: RoomPriceSearchParams
  ): Promise<
    PageResponse<RoomPriceResponse>
  > {

    const response =
      await api.get<
        PageResponse<RoomPriceResponse>
      >(
        "/room-prices",
        {
          params: {
            roomId:
              params.roomId,

            pricingUnitId:
              params.pricingUnitId,

            status:
              params.status,

            effectiveDate:
              params.effectiveDate,

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
              "effectiveFrom,desc",
          },
        }
      );

    return response.data;
  },


  async getById(
    id: number
  ): Promise<RoomPriceResponse> {

    const response =
      await api.get<RoomPriceResponse>(
        `/room-prices/${id}`
      );

    return response.data;
  },


  async create(
    request: CreateRoomPriceRequest
  ): Promise<RoomPriceResponse> {

    const response =
      await api.post<RoomPriceResponse>(
        "/room-prices",
        request
      );

    return response.data;
  },


  async update(
    id: number,
    request: UpdateRoomPriceRequest
  ): Promise<RoomPriceResponse> {

    const response =
      await api.put<RoomPriceResponse>(
        `/room-prices/${id}`,
        request
      );

    return response.data;
  },


  async deactivate(
    id: number
  ): Promise<void> {

    await api.post(
      `/room-prices/${id}/deactivate`
    );
  },


  async getRoomPriceHistory(
    roomId: number
  ): Promise<RoomPriceResponse[]> {

    const response =
      await api.get<RoomPriceResponse[]>(
        `/rooms/${roomId}/prices`
      );

    return response.data;
  },
};




