import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomBlockApi } from "../api/roomBlockApi";

import { roomBlockKeys } from "./roomBlockKeys";

import type { CreateRoomBlockRequest } from "../types/roomBlock";

export function useCreateRoomBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateRoomBlockRequest) =>
      roomBlockApi.create(request),

    onSuccess: (roomBlock) => {
      queryClient.setQueryData(roomBlockKeys.detail(roomBlock.id), roomBlock);

      queryClient.invalidateQueries({
        queryKey: roomBlockKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: roomBlockKeys.byRoom(roomBlock.roomId),
      });

      /*
       * A room block changes availability.
       */
      queryClient.invalidateQueries({
        queryKey: ["availability"],
      });
    },
  });
}
