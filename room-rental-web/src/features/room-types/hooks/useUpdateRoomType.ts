
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomTypeApi } from "../api/roomTypeApi";

import { roomTypeKeys } from "./roomTypeKeys";

import type { UpdateRoomTypeRequest } from "../types/roomType";

export function useUpdateRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: UpdateRoomTypeRequest;
    }) => roomTypeApi.update(id, request),

    onSuccess: (roomType) => {
      queryClient.setQueryData(roomTypeKeys.detail(roomType.id), roomType);

      queryClient.invalidateQueries({
        queryKey: roomTypeKeys.lists(),
      });
    },
  });
}
