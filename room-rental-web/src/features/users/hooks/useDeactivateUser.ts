import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userApi } from "../api/userApi";

import { userKeys } from "./userKeys";

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userApi.deactivate(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(id),
      });

      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
  });
}
