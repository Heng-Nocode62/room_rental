import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomApi } from "../api/roomApi";
import { roomKeys } from "./roomKeys";

export function useRemoveRoomAmenity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      amenityId,
    }: {
      roomId: number;
      amenityId: number;
    }) => roomApi.removeAmenity(roomId, amenityId),

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
