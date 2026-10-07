import { useMutation, useQueryClient } from "@tanstack/react-query";

import { configApi } from "../api/configApi";
import { configKeys } from "./configKeys";

import type { AppFontConfig } from "../types/config";

export function useUpdateFontConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AppFontConfig) => configApi.updateFont(request),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.global() });
    },
  });
}
