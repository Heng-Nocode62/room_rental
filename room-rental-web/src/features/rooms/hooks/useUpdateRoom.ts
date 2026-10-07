import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomApi } from "../api/roomApi";
import { roomKeys } from "./roomKeys";
import type { UpdateRoomRequest } from "../types/room";

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: UpdateRoomRequest;
    }) => roomApi.update(id, request),

    onSuccess: (room) => {
      queryClient.setQueryData(roomKeys.detail(room.id), room);
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
}
