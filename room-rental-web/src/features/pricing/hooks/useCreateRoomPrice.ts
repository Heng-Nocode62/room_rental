import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomPriceApi } from "../api/roomPriceApi";

import { roomPriceKeys } from "./roomPriceKeys";

import type { CreateRoomPriceRequest } from "../types/roomPrice";

export function useCreateRoomPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateRoomPriceRequest) =>
      roomPriceApi.create(request),

    onSuccess: (price) => {
      queryClient.setQueryData(roomPriceKeys.detail(price.id), price);

      queryClient.invalidateQueries({
        queryKey: roomPriceKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: ["availability"],
      });
    },
  });
}
