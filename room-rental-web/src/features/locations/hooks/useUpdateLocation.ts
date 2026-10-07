

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
  UpdateLocationRequest,
} from "../types/location";

export function useUpdateLocation() {

  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: UpdateLocationRequest;
    }) =>
      locationApi.update(
        id,
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