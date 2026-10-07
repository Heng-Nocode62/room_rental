import {
  useQuery,
} from "@tanstack/react-query";

import {
  roomBlockApi,
} from "../api/roomBlockApi";

import {
  roomBlockKeys,
} from "./roomBlockKeys";

export function useRoomBlock(
  id: number
) {
  return useQuery({
    queryKey:
      roomBlockKeys.detail(id),

    queryFn: () =>
      roomBlockApi.getById(id),

    enabled:
      Number.isFinite(id),

    staleTime: 15_000,
  });
}