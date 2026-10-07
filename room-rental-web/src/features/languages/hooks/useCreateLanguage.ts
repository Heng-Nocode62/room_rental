import { useMutation, useQueryClient } from "@tanstack/react-query";
import { languageApi } from "../api/languageApi";
import { languageKeys } from "./languageKeys";
import type { CreateLanguageRequest } from "../types/language";

export function useCreateLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateLanguageRequest) => languageApi.create(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: languageKeys.lists() }),
  });
}
