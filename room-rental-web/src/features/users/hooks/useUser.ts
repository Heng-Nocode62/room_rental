
import { useQuery } from "@tanstack/react-query";

import { userApi } from "../api/userApi";

import { userKeys } from "./userKeys";

export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),

    queryFn: () => userApi.getById(id),

    enabled: Number.isFinite(id),

    staleTime: 15_000,
  });
}
