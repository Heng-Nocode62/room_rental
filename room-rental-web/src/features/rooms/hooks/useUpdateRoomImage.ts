import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomApi } from "../api/roomApi";
import { roomKeys } from "./roomKeys";

export function useUpdateRoomImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      image,
    }: {
      id: number;
      image: File;
    }) => roomApi.updateImage(id, image),

    onSuccess: (room) => {
      queryClient.setQueryData(roomKeys.detail(room.id), room);
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
}