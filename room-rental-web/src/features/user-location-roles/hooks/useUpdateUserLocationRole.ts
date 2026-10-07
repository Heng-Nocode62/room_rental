import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userLocationRoleApi } from "../api/userLocationRoleApi";
import { userLocationRoleKeys } from "./userLocationRoleKeys";
import type { UserLocationRoleRequest } from "../types/userLocationRole";

export function useUpdateUserLocationRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UserLocationRoleRequest }) =>
      userLocationRoleApi.update(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userLocationRoleKeys.all });
    },
  });
}
