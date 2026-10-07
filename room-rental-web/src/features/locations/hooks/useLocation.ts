
import { useQuery } from "@tanstack/react-query";

import { locationApi } from "../api/locationApi";

import { locationKeys } from "./locationKeys";

export function useLocation(id: number) {
  return useQuery({
    queryKey: locationKeys.detail(id),

    queryFn: () => locationApi.getById(id),

    enabled: Number.isFinite(id),

    staleTime: 5 * 60 * 1000,
  });
}
