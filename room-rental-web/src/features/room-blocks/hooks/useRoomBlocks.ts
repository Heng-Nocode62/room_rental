import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { roomBlockApi } from "../api/roomBlockApi";

import { roomBlockKeys } from "./roomBlockKeys";

import type { RoomBlockSearchParams } from "../types/roomBlock";

export function useRoomBlocks(params: RoomBlockSearchParams) {
  return useQuery({
    queryKey: roomBlockKeys.list(params),

    queryFn: () => roomBlockApi.search(params),

    placeholderData: keepPreviousData,

    staleTime: 15_000,
  });
}
