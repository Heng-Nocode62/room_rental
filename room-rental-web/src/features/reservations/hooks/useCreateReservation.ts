import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { reservationApi } from "../api/reservationApi";

import {
  reservationKeys,
} from "./reservationKeys";

import type {
  CreateReservationRequest,
} from "../types/reservation";

export function useCreateReservation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      request: CreateReservationRequest,
    ) =>
      reservationApi.create(
        request,
      ),

    onSuccess: (
      reservation,
    ) => {

      /*
       * Reservation detail
       */

      queryClient.setQueryData(
        reservationKeys.detail(
          reservation.id,
        ),
        reservation,
      );

      queryClient.invalidateQueries({
        queryKey:
          reservationKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: [
          "availability",
        ],
      });
    },
  });
}