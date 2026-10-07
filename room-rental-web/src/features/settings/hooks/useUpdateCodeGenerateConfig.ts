import { useMutation, useQueryClient } from "@tanstack/react-query";

import { configApi } from "../api/configApi";
import { configKeys } from "./configKeys";

import type { CodeGenerateConfig } from "../types/config";

export function useUpdateCodeGenerateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CodeGenerateConfig) =>
      configApi.updateCodeGenerateRequestTest(request),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.global() });
    },
  });
}
