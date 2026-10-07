import { useQuery } from "@tanstack/react-query";
import { userLocationRoleApi } from "../api/userLocationRoleApi";
import { userLocationRoleKeys } from "./userLocationRoleKeys";

export function useUserLocationRolesByUser(userId?: number) {
  return useQuery({
    queryKey: userId ? userLocationRoleKeys.byUser(userId) : userLocationRoleKeys.all,
    queryFn: () => userLocationRoleApi.getByUserId(userId as number),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}
