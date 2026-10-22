
import { useMutation } from "@tanstack/react-query";

import { authApi } from "../api/authApi";

import type { ChangeMyPasswordRequest } from "../types/auth";
export function useChangeMyPassword() {
  return useMutation({
    mutationFn: (request: ChangeMyPasswordRequest) =>
      authApi.changeMyPassword(request),
  });
}