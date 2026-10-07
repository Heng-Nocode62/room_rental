import { useMutation, useQueryClient } from "@tanstack/react-query";

import { configApi } from "../api/configApi";
import { configKeys } from "./configKeys";

import type { RootUserConfig } from "../types/config";

export function useUpdateRootUserConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RootUserConfig) =>
      configApi.updateRootUserConfig(request),

    onSuccess: (rootUserConfig) => {
      queryClient.setQueryData(configKeys.rootUser(), rootUserConfig);
    },
  });
}
