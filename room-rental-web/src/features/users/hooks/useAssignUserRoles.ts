import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userApi } from "../api/userApi";

import { userKeys } from "./userKeys";

import type { AssignRolesRequest } from "../types/user";

export function useAssignUserRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;

      request: AssignRolesRequest;
    }) => userApi.assignRoles(id, request),

    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user);

      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
  });
}
