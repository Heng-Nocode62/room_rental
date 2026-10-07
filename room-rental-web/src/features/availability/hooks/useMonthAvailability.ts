import { useQuery } from "@tanstack/react-query";

import { availabilityApi } from "../api/availabilityApi";

export const monthAvailabilityKeys = {
  all: ["availability", "month"] as const,

  month: (
    roomId: number,
    year: number,
    month: number,
  ) =>
    [
      ...monthAvailabilityKeys.all,
      roomId,
      year,
      month,
    ] as const,
};

export function useMonthAvailability(
  roomId: number,
  year: number,
  month: number,
) {
  return useQuery({
    queryKey: monthAvailabilityKeys.month(
      roomId,
      year,
      month,
    ),

    queryFn: () =>
      availabilityApi.getMonth({
        roomId,
        year,
        month,
      }),

    enabled:
      roomId > 0 &&
      year > 0 &&
      month >= 1 &&
      month <= 12,

    staleTime: 15_000,
  });
}