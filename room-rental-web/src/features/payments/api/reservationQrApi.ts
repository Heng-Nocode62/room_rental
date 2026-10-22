import { api } from "../../../lib/axios";

import type {
  ReservationQrResponse,
} from "../types/reservationQr";

export const reservationQrApi = {
  async generateForReservation(
    reservationId: number,
  ): Promise<ReservationQrResponse> {
    const response =
      await api.post<ReservationQrResponse>(
        `/reservations/${reservationId}/qr`,
      );

    return response.data;
  },
};