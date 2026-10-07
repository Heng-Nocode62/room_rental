import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApi } from "../api/authApi";
import { tokenStorage } from "../../../lib/tokenStorage";
import { currentUserQueryKey } from "./useCurrentUser";

export function useGoogleLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credential: string) => authApi.loginWithGoogle(credential),

    onSuccess: async (data) => {
      tokenStorage.setAccessToken(data.accessToken);

      await queryClient.fetchQuery({
        queryKey: currentUserQueryKey,
        queryFn: authApi.getMe,
      });
    },
  });
}
