import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { operatingHoursApi } from "../api/operatingHoursApi";
import { operatingHoursKeys } from "./operatingHoursKeys";

export function useDeleteOperatingHours() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      locationId,
      dayOfWeek,
    }: {
      locationId: number;
      dayOfWeek: number;
    }) => operatingHoursApi.delete(locationId, dayOfWeek),

    onSuccess: (_, variables) => {
      queryClient.setQueryData(
        operatingHoursKeys.byLocation(variables.locationId),
        (current: any[] | undefined) =>
          (current ?? []).filter(
            (item) => item.dayOfWeek !== variables.dayOfWeek
          )
      );
    },
  });
}
