import type { TranslationSearchParams } from "../types/translation";

export const translationKeys = {
  all: ["translations"] as const,

  lists: (languageCode: string) =>
    [...translationKeys.all, languageCode, "list"] as const,

  list: (languageCode: string, params: TranslationSearchParams) =>
    [...translationKeys.lists(languageCode), params] as const,
};
