import { useMutation, useQueryClient } from "@tanstack/react-query";
import { languageApi } from "../api/languageApi";
import { languageKeys } from "./languageKeys";

export function useToggleLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => languageApi.toggle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: languageKeys.all }),
  });
}
