
import { useMutation } from "@tanstack/react-query";

import { authApi } from "../api/authApi";

import type { UpdateMyProfileRequest } from "../types/auth";

export function useUpdateMyProfile() {
  return useMutation({
    mutationFn: (request: UpdateMyProfileRequest) =>
      authApi.updateMyProfile(request),
  });
}