import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import type { VerifyEmailRequest } from "../types/auth";

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (request: VerifyEmailRequest) => authApi.verifyEmail(request),
  });
}
