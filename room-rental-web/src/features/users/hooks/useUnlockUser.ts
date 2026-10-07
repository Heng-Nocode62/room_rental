

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userApi } from "../api/userApi";

import { userKeys } from "./userKeys";

export function useUnlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userApi.unlock(id),

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
