import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { locationApi } from "../api/locationApi";
import { locationKeys } from "./locationKeys";

export function useUpdateLocationImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      image,
    }: {
      id: number;
      image: File;
    }) => locationApi.updateImage(id, image),

    onSuccess: (location) => {
      queryClient.setQueryData(
        locationKeys.detail(location.id),
        location
      );

      queryClient.invalidateQueries({
        queryKey: locationKeys.lists(),
      });
    },
  });
}