import type { LanguageSearchParams } from "../types/language";

export const languageKeys = {
  all: ["languages"] as const,

  lists: () => [...languageKeys.all, "list"] as const,

  list: (params: LanguageSearchParams) =>
    [...languageKeys.lists(), params] as const,

  details: () => [...languageKeys.all, "detail"] as const,

  detail: (code: string) => [...languageKeys.details(), code] as const,
};
