import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reservationApi } from "../api/reservationApi";

import { reservationKeys } from "./reservationKeys";
import type { ReservationResponse } from "../types/reservation";

type ReservationAction = "confirm" | "cancel" | "checkIn" | "checkOut";

interface ReservationActionMap {
  confirm: (
    id: number
  ) => Promise<ReservationResponse>;

  cancel: (
    id: number
  ) => Promise<ReservationResponse>;

  checkIn: (
    id: number
  ) => Promise<ReservationResponse>;

  checkOut: (
    id: number
  ) => Promise<ReservationResponse>;
}

export function useReservationStatusMutation(action: ReservationAction) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservationId: number) => {
      const actions: ReservationActionMap = {
        confirm: reservationApi.confirm,

        cancel: reservationApi.cancel,

        checkIn: reservationApi.checkIn,

        checkOut: reservationApi.checkOut,
      };

      return actions[action](reservationId);
    },

    onSuccess: (reservation) => {
      queryClient.setQueryData(
        reservationKeys.detail(reservation.id),
        reservation,
      );

      queryClient.invalidateQueries({
        queryKey: reservationKeys.lists(),
      });
    },
  });
}
