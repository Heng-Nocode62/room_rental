import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { reservationApi } from "../api/reservationApi";

import { reservationKeys } from "./reservationKeys";

import type { ReservationSearchParams } from "../types/reservationSearch";

export function useReservations(params: ReservationSearchParams) {
  return useQuery({
    queryKey: reservationKeys.list(params),

    queryFn: () => reservationApi.search(params),

    placeholderData: keepPreviousData,

    staleTime: 15_000,
  });
}
