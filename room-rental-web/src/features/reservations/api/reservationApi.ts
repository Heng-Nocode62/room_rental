import { api } from "../../../lib/axios";

import type {
  CreateReservationRequest,
  ReservationResponse,
} from "../types/reservation";
import type { ReservationSearchParams } from "../types/reservationSearch";
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
export const reservationApi = {
  async search(
    params: ReservationSearchParams
  ): Promise<
    PageResponse<ReservationResponse>
  > {

    const response =
      await api.get<
        PageResponse<ReservationResponse>
      >(
        "/reservations",
        {
          params: {
            keyword: params.keyword,

            roomId: params.roomId,

            locationId:
              params.locationId,

            status:
              params.status,

            pricingUnitId:
              params.pricingUnitId,

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

  async create(
    request: CreateReservationRequest
  ): Promise<ReservationResponse> {

    const response =
      await api.post<ReservationResponse>(
        "/reservations",
        request
      );

    return response.data;
  },


  async getById(
    id: number
  ): Promise<ReservationResponse> {

    const response =
      await api.get<ReservationResponse>(
        `/reservations/${id}`
      );

    return response.data;
  },


  async confirm(
    id: number
  ): Promise<ReservationResponse> {

    const response =
      await api.post<ReservationResponse>(
        `/reservations/${id}/confirm`
      );

    return response.data;
  },


  async cancel(
    id: number
  ): Promise<ReservationResponse> {

    const response =
      await api.post<ReservationResponse>(
        `/reservations/${id}/cancel`
      );

    return response.data;
  },


  async checkIn(
    id: number
  ): Promise<ReservationResponse> {

    const response =
      await api.post<ReservationResponse>(
        `/reservations/${id}/check-in`
      );

    return response.data;
  },


  async checkOut(
    id: number
  ): Promise<ReservationResponse> {

    const response =
      await api.post<ReservationResponse>(
        `/reservations/${id}/check-out`
      );

    return response.data;
  },
  async getMyReservation(): Promise<ReservationResponse[]>{
    const response = await api.get("/auth/me/reservations");
    return response.data;
  }
};