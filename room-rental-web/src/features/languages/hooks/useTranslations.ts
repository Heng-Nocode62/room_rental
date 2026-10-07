import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { translationApi } from "../api/translationApi";
import { translationKeys } from "./translationKeys";
import type { TranslationSearchParams } from "../types/translation";

export function useTranslations(languageId: number | undefined, params: TranslationSearchParams = {}) {
  return useQuery({
    queryKey: translationKeys.list(String(languageId ?? ""), params),
    queryFn: () => translationApi.list(languageId!, params),
    enabled: Number.isFinite(languageId),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}
