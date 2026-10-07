import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import { tokenStorage } from "../../../lib/tokenStorage";
import { currentUserQueryKey } from "./useCurrentUser";
import type { LoginRequest } from "../types/auth";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: LoginRequest) => authApi.login(request),
    onSuccess: async (data) => {
      tokenStorage.setAccessToken(data.accessToken);
      await queryClient.fetchQuery({
        queryKey: currentUserQueryKey,
        queryFn: authApi.getMe,
      });
    },
  });
}
