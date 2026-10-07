import { useMutation, useQueryClient } from "@tanstack/react-query";
import { languageApi } from "../api/languageApi";
import { languageKeys } from "./languageKeys";
import type { UpdateLanguageRequest } from "../types/language";

export function useUpdateLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateLanguageRequest }) =>
      languageApi.update(id, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: languageKeys.all }),
  });
}
