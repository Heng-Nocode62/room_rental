
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  userApi,
} from "../api/userApi";

import {
  userKeys,
} from "./userKeys";

import type {
  ResetPasswordRequest,
} from "../types/user";


export function useResetPassword() {

  const queryClient =
    useQueryClient();


  return useMutation({

    mutationFn: ({
      id,
      request,
    }: {
      id: number;

      request:
        ResetPasswordRequest;
    }) =>
      userApi.resetPassword(
        id,
        request
      ),


    onSuccess: (
      _,
      variables
    ) => {

      queryClient.invalidateQueries({
        queryKey:
          userKeys.detail(
            variables.id
          ),
      });

    },
  });
}