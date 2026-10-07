
import { useQuery } from "@tanstack/react-query";

import { roomTypeApi } from "../api/roomTypeApi";

import { roomTypeKeys } from "./roomTypeKeys";

export function useRoomType(id: number) {
  return useQuery({
    queryKey: roomTypeKeys.detail(id),

    queryFn: () => roomTypeApi.getById(id),

    enabled: Number.isFinite(id),

    staleTime: 5 * 60 * 1000,
  });
}
