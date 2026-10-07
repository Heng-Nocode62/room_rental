import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import type { ResendOtpRequest } from "../types/auth";

export function useResendOtp() {
  return useMutation({
    mutationFn: (request: ResendOtpRequest) => authApi.resendOtp(request),
  });
}
