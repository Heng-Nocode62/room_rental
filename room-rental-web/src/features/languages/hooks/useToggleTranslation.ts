import { useMutation, useQueryClient } from "@tanstack/react-query";
import { translationApi } from "../api/translationApi";
import { translationKeys } from "./translationKeys";

export function useToggleTranslation(languageId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (translationId: number) => translationApi.toggle(translationId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: translationKeys.lists(String(languageId)),
      }),
  });
}
