import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userApi } from "../api/userApi";

import { userKeys } from "./userKeys";

import type { UpdateUserRequest } from "../types/user";

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateUserRequest }) =>
      userApi.update(id, request),

    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user);

      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
  });
}
