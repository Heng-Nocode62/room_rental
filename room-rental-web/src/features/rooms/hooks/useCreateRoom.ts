import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomApi } from "../api/roomApi";
import { roomKeys } from "./roomKeys";
import type { CreateRoomRequest } from "../types/room";

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateRoomRequest) => roomApi.create(request),
    onSuccess: (room) => {
      queryClient.setQueryData(roomKeys.detail(room.id), room);
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: roomKeys.locationAmenities(room.locationId),
      });
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
    },
  });
}
