import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomPriceApi } from "../api/roomPriceApi";

import { roomPriceKeys } from "./roomPriceKeys";

export function useDeactivateRoomPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roomPriceApi.deactivate(id),

    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: roomPriceKeys.detail(id),
      });

      queryClient.invalidateQueries({
        queryKey: roomPriceKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: ["availability"],
      });
    },
  });
}
