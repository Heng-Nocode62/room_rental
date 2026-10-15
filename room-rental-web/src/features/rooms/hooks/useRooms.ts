import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { roomApi } from "../api/roomApi";
import { roomKeys } from "./roomKeys";
import type { RoomSearchParams } from "../types/room";

export function useRooms(params: RoomSearchParams,enabled = true) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: () => roomApi.search(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
  
}

export function useRoomsWithEnable(params: RoomSearchParams, enabled = true) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: () => roomApi.search(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}
