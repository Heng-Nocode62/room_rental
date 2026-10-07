

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userApi } from "../api/userApi";

import { userKeys } from "./userKeys";

import type { ChangePasswordRequest } from "../types/user";

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;

      request: ChangePasswordRequest;
    }) => userApi.changePassword(id, request),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
    },
  });
}
