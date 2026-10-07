import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomApi } from "../api/roomApi";
import { roomKeys } from "./roomKeys";

export function useDeactivateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roomApi.deactivate(id),

    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: roomKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
}
