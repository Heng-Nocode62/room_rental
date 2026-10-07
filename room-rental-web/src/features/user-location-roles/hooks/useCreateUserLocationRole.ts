import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userLocationRoleApi } from "../api/userLocationRoleApi";
import { userLocationRoleKeys } from "./userLocationRoleKeys";
import type { UserLocationRoleRequest } from "../types/userLocationRole";

export function useCreateUserLocationRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UserLocationRoleRequest) => userLocationRoleApi.create(request),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: userLocationRoleKeys.all });
      queryClient.invalidateQueries({ queryKey: userLocationRoleKeys.byUser(item.userId) });
      queryClient.invalidateQueries({ queryKey: userLocationRoleKeys.byLocation(item.locationId) });
    },
  });
}
