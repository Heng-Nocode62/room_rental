import { useMutation, useQueryClient } from "@tanstack/react-query";
import { languageApi } from "../api/languageApi";
import { languageKeys } from "./languageKeys";

export function useDeleteLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => languageApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: languageKeys.all }),
  });
}
