import { useMutation, useQueryClient } from "@tanstack/react-query";

import { configApi } from "../api/configApi";
import { configKeys } from "./configKeys";

import type { EditApprovedReportConfig } from "../types/config";

export function useUpdateEditApprovedReportConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: EditApprovedReportConfig) =>
      configApi.updateEditApprovedReport(request),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.global() });
    },
  });
}
