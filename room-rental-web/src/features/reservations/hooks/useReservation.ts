import { useQuery } from "@tanstack/react-query";

import { reservationApi } from "../api/reservationApi";

import { reservationKeys } from "./reservationKeys";

export function useReservation(id: number) {
  return useQuery({
    queryKey: reservationKeys.detail(id),

    queryFn: () => reservationApi.getById(id),

    enabled: Number.isFinite(id),

    staleTime: 15_000,
  });
}
