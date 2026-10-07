import { useQuery } from "@tanstack/react-query";

import { availabilityApi } from "../api/availabilityApi";

export const availabilityKeys = {
  all: ["availability"] as const,

  day: (roomId: number, date: string) =>
    [...availabilityKeys.all, "day", roomId, date] as const,

  overview: (date: string, roomTypeId?: number, locationId?: number) =>
    [
      ...availabilityKeys.all,
      "overview",
      date,
      roomTypeId,
      locationId,
    ] as const,
};

export function useDayAvailabilityOverview(
  date: string,
  roomTypeId?: number,
  locationId?: number,
) {
  return useQuery({
    queryKey: availabilityKeys.overview(date, roomTypeId, locationId),

    queryFn: () => availabilityApi.getDayOverview(date, roomTypeId, locationId),

    enabled: date.length > 0,

    staleTime: 15_000,
  });
}
