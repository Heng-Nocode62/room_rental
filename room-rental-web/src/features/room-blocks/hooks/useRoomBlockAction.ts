import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomBlockApi } from "../api/roomBlockApi";

import { roomBlockKeys } from "./roomBlockKeys";

import type { RoomBlockResponse } from "../types/roomBlock";

type RoomBlockAction = "complete" | "cancel";

export function useRoomBlockAction(action: RoomBlockAction) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number): Promise<RoomBlockResponse> => {
      if (action === "complete") {
        return roomBlockApi.complete(id);
      }

      return roomBlockApi.cancel(id);
    },

    onSuccess: (roomBlock) => {
      queryClient.setQueryData(roomBlockKeys.detail(roomBlock.id), roomBlock);

      queryClient.invalidateQueries({
        queryKey: roomBlockKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: roomBlockKeys.byRoom(roomBlock.roomId),
      });

      /*
       * Room block status affects
       * availability.
       */
      queryClient.invalidateQueries({
        queryKey: ["availability"],
      });
    },
  });
}
