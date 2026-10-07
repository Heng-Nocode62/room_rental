import { useMutation, useQueryClient } from "@tanstack/react-query";

import { translationApi } from "../api/translationApi";
import { translationKeys } from "./translationKeys";

import type { UpsertGlobalTranslationRequest } from "../types/translation";

export function useUpsertGlobalTranslation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpsertGlobalTranslationRequest) =>
      translationApi.upsertGlobal(request),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: translationKeys.all });
    },
  });
}
