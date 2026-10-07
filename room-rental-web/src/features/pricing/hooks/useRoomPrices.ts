
import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import {
  roomPriceApi,
} from "../api/roomPriceApi";

import {
  roomPriceKeys,
} from "./roomPriceKeys";

import type {
  RoomPriceSearchParams,
} from "../types/roomPrice";

export function useRoomPrices(
  params: RoomPriceSearchParams
) {

  return useQuery({
    queryKey:
      roomPriceKeys.list(
        params
      ),

    queryFn: () =>
      roomPriceApi.search(
        params
      ),

    placeholderData:
      keepPreviousData,

    staleTime:
      30_000,
  });
}