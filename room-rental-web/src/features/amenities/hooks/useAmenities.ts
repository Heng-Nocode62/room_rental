import { useQuery } from "@tanstack/react-query";

import { amenityApi } from "../api/amenityApi";
import { amenityKeys } from "./amenityKeys";
import type {
  AmenityListParams,
  AmenityResponse,
  PageResponse,
} from "../types/amenity";

export function useAmenities(filters: AmenityListParams = {}) {
  const { locationId, ...searchParams } = filters;

  return useQuery<PageResponse<AmenityResponse>>({
    queryKey: amenityKeys.list(filters),

    queryFn: () =>
      locationId
        ? amenityApi.getByLocationId(locationId, searchParams)
        : amenityApi.getAll(searchParams),

    staleTime: 5 * 60 * 1000,
  });
}
