import { useMutation, useQueryClient } from "@tanstack/react-query";

import { configApi } from "../api/configApi";
import { configKeys } from "./configKeys";

import type { CmsConfig } from "../types/config";

export function useUpdateCmsConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CmsConfig) => configApi.updateCmsConfig(request),

    onSuccess: (cmsConfig) => {
      queryClient.setQueryData(configKeys.cms(), cmsConfig);
    },
  });
}
