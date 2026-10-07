import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApi } from "../api/authApi";
import { tokenStorage } from "../../../lib/tokenStorage";
import { currentUserQueryKey } from "./useCurrentUser";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),

    onSettled: () => {
      tokenStorage.clear();

      queryClient.removeQueries({
        queryKey: currentUserQueryKey,
      });
    },
  });
}
