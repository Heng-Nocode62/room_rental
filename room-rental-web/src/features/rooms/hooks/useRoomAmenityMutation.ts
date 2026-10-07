import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomApi } from "../api/roomApi";
import { roomKeys } from "./roomKeys";

interface Variables {
  roomId: number;
  amenityId: number;
  amount?: number;
}

type Action = "add" | "remove";

export function useRoomAmenityMutation(action: Action) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      amenityId,
      amount,
    }: Variables) => {
      if (action === "add") {
        return roomApi.addAmenity(roomId, {
          amenityId,
          amount: amount ?? 1,
        });
      }

      return roomApi.removeAmenity(roomId, amenityId);
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: roomKeys.detail(variables.roomId),
      });
      queryClient.invalidateQueries({
        queryKey: roomKeys.amenities(variables.roomId),
      });
      queryClient.invalidateQueries({
        queryKey: roomKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: roomKeys.locationAmenitiesRoot(),
      });
    },
  });
}
