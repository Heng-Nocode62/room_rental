import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userApi } from "../api/userApi";

import { userKeys } from "./userKeys";

import type { CreateUserRequest } from "../types/user";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateUserRequest) => userApi.create(request),

    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user);

      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
  });
}
