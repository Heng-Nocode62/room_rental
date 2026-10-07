
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

import type {
  CreateLocationRequest,
} from "../types/location";

export function useCreateLocation() {

  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      request: CreateLocationRequest
    ) =>
      locationApi.create(
        request
      ),

    onSuccess: (location) => {

      queryClient.setQueryData(
        locationKeys.detail(
          location.id
        ),
        location
      );

      queryClient.invalidateQueries({
        queryKey:
          locationKeys.lists(),
      });
    },
  });
}