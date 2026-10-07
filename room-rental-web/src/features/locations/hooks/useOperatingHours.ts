import { useQuery } from "@tanstack/react-query";

import { operatingHoursApi } from "../api/operatingHoursApi";
import { operatingHoursKeys } from "./operatingHoursKeys";

export function useOperatingHours(locationId: number) {
  return useQuery({
    queryKey: operatingHoursKeys.byLocation(locationId),
    queryFn: () => operatingHoursApi.getByLocation(locationId),
    enabled:
      !!locationId &&
      locationId > 0,
    staleTime: 5 * 60 * 1000,
  });
}
