import { useQuery } from "@tanstack/react-query";

import { amenityApi } from "../api/amenityApi";
import { amenityKeys } from "./amenityKeys";

export function useAmenity(id: number) {
  return useQuery({
    queryKey: amenityKeys.detail(id),

    queryFn: () => amenityApi.getById(id),

    enabled: Number.isFinite(id),

    staleTime: 5 * 60 * 1000,
  });
}
