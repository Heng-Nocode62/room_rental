import { useMutation, useQueryClient } from "@tanstack/react-query";
import { translationApi } from "../api/translationApi";
import { translationKeys } from "./translationKeys";
import { languageKeys } from "./languageKeys";

export function useImportTranslations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => translationApi.import(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: translationKeys.all });
      queryClient.invalidateQueries({ queryKey: languageKeys.all });
    },
  });
}
