
import { useQuery } from "@tanstack/react-query";

import { locationApi } from "../api/locationApi";

import { locationKeys } from "./locationKeys";

export function useLocations() {
  return useQuery({
    queryKey: locationKeys.lists(),

    queryFn: locationApi.getAll,

    staleTime: 5 * 60 * 1000,
  });
}

export function useLocationsWithEnable(enabled = true) {
  return useQuery({
    queryKey: locationKeys.lists(),

    queryFn: locationApi.getAll,

    enabled,

    staleTime: 5 * 60 * 1000,
  });
}