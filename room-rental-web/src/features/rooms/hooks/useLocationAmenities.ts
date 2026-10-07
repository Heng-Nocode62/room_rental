import { useQuery } from "@tanstack/react-query";

import { api } from "../../../lib/axios";
import { roomKeys } from "./roomKeys";

import type { AmenityResponse, PageResponse } from "../types/room";

export function useLocationAmenities(
  locationId?: number,
  enabled = true,
) {
  return useQuery({
    queryKey: roomKeys.locationAmenities(locationId),

    queryFn: async () => {
      const response = await api.get<PageResponse<AmenityResponse>>(
        `/amenities/location/${locationId}`,
        {
          params: {
            page: 0,
            size: 100,
            sort: "name,asc",
            status: "ACTIVE",
          },
        },
      );

      return response.data.content;
    },

    enabled: enabled && Number.isFinite(locationId),
    staleTime: 60_000,
  });
}
