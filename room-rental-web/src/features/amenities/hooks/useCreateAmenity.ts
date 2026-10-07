import { useMutation, useQueryClient } from "@tanstack/react-query";

import { amenityApi } from "../api/amenityApi";
import { amenityKeys } from "./amenityKeys";
import type { CreateAmenityRequest } from "../types/amenity";

export function useCreateAmenity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateAmenityRequest) => amenityApi.create(request),

    onSuccess: (amenity) => {
      queryClient.setQueryData(amenityKeys.detail(amenity.id), amenity);

      queryClient.invalidateQueries({
        queryKey: amenityKeys.lists(),
      });
    },
  });
}
