
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomTypeApi } from "../api/roomTypeApi";

import { roomTypeKeys } from "./roomTypeKeys";

export function useDeactivateRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roomTypeApi.deactivate(id),

    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: roomTypeKeys.detail(id),
      });

      queryClient.invalidateQueries({
        queryKey: roomTypeKeys.lists(),
      });
    },
  });
}
