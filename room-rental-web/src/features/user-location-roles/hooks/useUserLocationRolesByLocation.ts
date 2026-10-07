import { useQuery } from "@tanstack/react-query";
import { userLocationRoleApi } from "../api/userLocationRoleApi";
import { userLocationRoleKeys } from "./userLocationRoleKeys";

export function useUserLocationRolesByLocation(locationId?: number) {
  return useQuery({
    queryKey: locationId ? userLocationRoleKeys.byLocation(locationId) : userLocationRoleKeys.all,
    queryFn: () => userLocationRoleApi.getByLocationId(locationId as number),
    enabled: Boolean(locationId),
    staleTime: 15_000,
  });
}
