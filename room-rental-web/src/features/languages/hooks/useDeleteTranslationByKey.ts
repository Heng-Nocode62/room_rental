import { useMutation, useQueryClient } from "@tanstack/react-query";

import { translationApi } from "../api/translationApi";
import { translationKeys } from "./translationKeys";

export function useDeleteTranslationByKey(languageCode: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => translationApi.deleteByKey(key),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: translationKeys.lists(languageCode),
      });
    },
  });
}
