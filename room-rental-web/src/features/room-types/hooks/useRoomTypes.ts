import { useQuery } from "@tanstack/react-query";

import { roomTypeApi } from "../api/roomTypeApi";

import { roomTypeKeys } from "./roomTypeKeys";

export function useRoomTypes() {
  return useQuery({
    queryKey: roomTypeKeys.lists(),

    queryFn: roomTypeApi.getAll,

    staleTime: 5 * 60 * 1000,
  });
}
