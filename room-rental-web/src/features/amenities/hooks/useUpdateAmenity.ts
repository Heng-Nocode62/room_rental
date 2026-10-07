import { useMutation, useQueryClient } from "@tanstack/react-query";

import { amenityApi } from "../api/amenityApi";
import { amenityKeys } from "./amenityKeys";
import type { UpdateAmenityRequest } from "../types/amenity";

export function useUpdateAmenity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: UpdateAmenityRequest;
    }) => amenityApi.update(id, request),

    onSuccess: (amenity) => {
      queryClient.setQueryData(amenityKeys.detail(amenity.id), amenity);

      queryClient.invalidateQueries({
        queryKey: amenityKeys.lists(),
      });
    },
  });
}
