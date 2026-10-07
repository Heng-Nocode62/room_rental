// src/features/availability/hooks/useDayAvailability.ts

import { useQuery } from "@tanstack/react-query";

import { availabilityApi } from "../api/availabilityApi";

export const availabilityKeys = {
  all: ["availability"] as const,

  day: (roomId: number, date: string) =>
    [...availabilityKeys.all, "day", roomId, date] as const,
};

export function useDayAvailability(roomId: number, date: string) {
  return useQuery({
    queryKey: availabilityKeys.day(roomId, date),

    queryFn: () =>
      availabilityApi.getDay({
        roomId,
        date,
      }),

    enabled: Number.isFinite(roomId) && date.length > 0,

    staleTime: 15_000,
  });
}
