import { useQuery } from "@tanstack/react-query";

import { roomTypeApi } from "../api/roomTypeApi";
import { roomTypeKeys } from "./roomTypeKeys";

export function useRoomTypesByLocation(
  locationId: number | null | undefined,
) {
  return useQuery({
    queryKey: roomTypeKeys.byLocation(locationId ?? null),

    queryFn: () => {
      if (locationId == null) {
        throw new Error("A location ID is required.");
      }

      return roomTypeApi.getByLocationId(locationId);
    },

    enabled: locationId != null,

    staleTime: 5 * 60 * 1000,
  });
}