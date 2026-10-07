import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomTypeApi } from "../api/roomTypeApi";

import { roomTypeKeys } from "./roomTypeKeys";

import type { CreateRoomTypeRequest } from "../types/roomType";

export function useCreateRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateRoomTypeRequest) => roomTypeApi.create(request),

    onSuccess: (roomType) => {
      queryClient.setQueryData(roomTypeKeys.detail(roomType.id), roomType);

      queryClient.invalidateQueries({
        queryKey: roomTypeKeys.lists(),
      });
    },
  });
}
