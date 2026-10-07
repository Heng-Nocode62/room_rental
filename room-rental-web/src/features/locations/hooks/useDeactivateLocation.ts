
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  locationApi,
} from "../api/locationApi";

import {
  locationKeys,
} from "./locationKeys";

export function useDeactivateLocation() {

  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number
    ) =>
      locationApi.deactivate(
        id
      ),

    onSuccess: (
      _,
      id
    ) => {

      queryClient.removeQueries({
        queryKey:
          locationKeys.detail(id),
      });

      queryClient.invalidateQueries({
        queryKey:
          locationKeys.lists(),
      });
    },
  });
}