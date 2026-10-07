import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { roomApi } from "../api/roomApi";
import { roomKeys } from "./roomKeys";
import type { RoomSearchParams } from "../types/room";

export function useRooms(params: RoomSearchParams) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: () => roomApi.search(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}
