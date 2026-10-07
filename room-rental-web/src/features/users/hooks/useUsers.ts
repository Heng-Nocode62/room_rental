import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { userApi } from "../api/userApi";

import { userKeys } from "./userKeys";

import type { UserSearchParams } from "../types/user";

export function useUsers(params: UserSearchParams) {
  return useQuery({
    queryKey: userKeys.list(params),

    queryFn: () => userApi.search(params),

    placeholderData: keepPreviousData,

    staleTime: 15_000,
  });
}
