import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userLocationRoleApi } from "../api/userLocationRoleApi";
import { userLocationRoleKeys } from "./userLocationRoleKeys";

export function useDeleteUserLocationRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userLocationRoleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userLocationRoleKeys.all });
    },
  });
}
