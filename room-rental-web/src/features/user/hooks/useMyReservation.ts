import { useQuery } from "@tanstack/react-query";

import { reservationApi } from "../../reservations/api/reservationApi";

export const userReservationKeys = {
  all: ["user-reservations"] as const,
  list: () => [...userReservationKeys.all, "list"] as const,
};

export function useMyReservations() {
  return useQuery({
    queryKey: userReservationKeys.list(),
    queryFn: reservationApi.getMyReservation,
    staleTime: 15_000,
  });
}