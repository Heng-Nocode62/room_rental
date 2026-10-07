import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomApi } from "../api/roomApi";
import { roomKeys } from "./roomKeys";

export function useAddRoomAmenity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      amenityId,
      amount,
    }: {
      roomId: number;
      amenityId: number;
      amount: number;
    }) => roomApi.addAmenity(roomId, { amenityId, amount }),

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
