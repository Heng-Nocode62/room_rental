import { useMutation, useQueryClient } from "@tanstack/react-query";

import { configApi } from "../api/configApi";
import { configKeys } from "./configKeys";

import type { AppDatetimeConfig } from "../types/config";

export function useUpdateDatetimeConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AppDatetimeConfig) =>
      configApi.updateDatetimeFormat(request),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.global() });
    },
  });
}
