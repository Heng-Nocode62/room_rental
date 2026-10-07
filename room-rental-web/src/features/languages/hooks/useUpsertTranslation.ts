import { useMutation, useQueryClient } from "@tanstack/react-query";
import { translationApi } from "../api/translationApi";
import { translationKeys } from "./translationKeys";

export function useUpsertTranslation(languageId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: import("../types/translation").UpsertTranslationRequest) =>
      translationApi.upsert(languageId, request),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: translationKeys.lists(String(languageId)),
      }),
  });
}
