import { useQuery } from "@tanstack/react-query";

import { roomPriceApi } from "../api/roomPriceApi";

import { roomPriceKeys } from "./roomPriceKeys";

export function useRoomPrice(id: number) {
  return useQuery({
    queryKey: roomPriceKeys.detail(id),

    queryFn: () => roomPriceApi.getById(id),

    enabled: Number.isFinite(id),

    staleTime: 30_000,
  });
}
