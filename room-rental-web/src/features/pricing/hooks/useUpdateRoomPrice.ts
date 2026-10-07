import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomPriceApi } from "../api/roomPriceApi";

import { roomPriceKeys } from "./roomPriceKeys";

import type { UpdateRoomPriceRequest } from "../types/roomPrice";

export function useUpdateRoomPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;

      request: UpdateRoomPriceRequest;
    }) => roomPriceApi.update(id, request),

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
