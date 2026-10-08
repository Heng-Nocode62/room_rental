import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomTypeApi } from "../api/roomTypeApi";
import { roomTypeKeys } from "./roomTypeKeys";

export function useUpdateRoomTypeImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      image,
    }: {
      id: number;
      image: File;
    }) => roomTypeApi.updateImage(id, image),

    onSuccess: (roomType) => {
      queryClient.setQueryData(
        roomTypeKeys.detail(roomType.id),
        roomType,
      );

      queryClient.invalidateQueries({
        queryKey: roomTypeKeys.lists(),
      });
    },
  });
}