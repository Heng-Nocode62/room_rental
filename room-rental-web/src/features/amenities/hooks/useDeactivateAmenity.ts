import { useMutation, useQueryClient } from "@tanstack/react-query";

import { amenityApi } from "../api/amenityApi";
import { amenityKeys } from "./amenityKeys";

export function useDeactivateAmenity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => amenityApi.deactivate(id),

    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: amenityKeys.detail(id),
      });

      queryClient.invalidateQueries({
        queryKey: amenityKeys.lists(),
      });
    },
  });
}
