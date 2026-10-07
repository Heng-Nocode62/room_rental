import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { languageApi } from "../api/languageApi";
import { languageKeys } from "./languageKeys";
import type { LanguageSearchParams } from "../types/language";

export function useLanguages(params: LanguageSearchParams = {}) {
  return useQuery({
    queryKey: languageKeys.list(params),
    queryFn: () => languageApi.search(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}
