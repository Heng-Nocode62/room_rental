import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { operatingHoursApi } from "../api/operatingHoursApi";
import { operatingHoursKeys } from "./operatingHoursKeys";

import type { OperatingHoursRequest } from "../types/operatingHours";

export function useUpdateOperatingHours() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      locationId,
      dayOfWeek,
      request,
    }: {
      locationId: number;
      dayOfWeek: number;
      request: OperatingHoursRequest;
    }) =>
      operatingHoursApi.upsert(
        locationId,
        dayOfWeek,
        request
      ),

    onSuccess: (updated) => {
      queryClient.setQueryData(
        operatingHoursKeys.byLocation(updated.locationId),
        (current: any[] | undefined) => {
          const existing = current ?? [];
          const index = existing.findIndex(
            (item) => item.dayOfWeek === updated.dayOfWeek
          );

          if (index === -1) {
            return [...existing, updated].sort(
              (a, b) => a.dayOfWeek - b.dayOfWeek
            );
          }

          return existing.map((item, i) =>
            i === index ? updated : item
          );
        }
      );
    },
  });
}
