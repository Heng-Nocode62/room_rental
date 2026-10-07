import { useMutation, useQueryClient } from "@tanstack/react-query";

import { configApi } from "../api/configApi";
import { configKeys } from "./configKeys";

import type { AppConfig } from "../types/config";

export function useUpdateAppConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AppConfig) => configApi.updateAppConfig(request),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.global() });
    },
  });
}
