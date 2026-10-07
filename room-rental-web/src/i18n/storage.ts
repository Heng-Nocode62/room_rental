
import type { RuntimeTranslations } from "./types";

const LANGUAGE_KEY = "app.language";
const TRANSLATION_PREFIX = "app.translations.";

export interface CachedTranslation {
  translations: RuntimeTranslations;
  version?: string | number;
  cachedAt: number;
}

export function getStoredLanguage(
  defaultLanguage = "en",
): string {
  return (
    localStorage.getItem(LANGUAGE_KEY) ??
    defaultLanguage
  );
}

export function setStoredLanguage(
  languageCode: string,
): void {
  localStorage.setItem(
    LANGUAGE_KEY,
    languageCode,
  );
}

function getCacheKey(languageCode: string): string {
  return `${TRANSLATION_PREFIX}${languageCode}`;
}

export function getCachedTranslations(
  languageCode: string,
): CachedTranslation | null {
  const value = localStorage.getItem(
    getCacheKey(languageCode),
  );

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as CachedTranslation;
  } catch {
    localStorage.removeItem(
      getCacheKey(languageCode),
    );

    return null;
  }
}

export function saveCachedTranslations(
  languageCode: string,
  translations: RuntimeTranslations,
  version?: string | number,
): void {
  const cache: CachedTranslation = {
    translations,
    version,
    cachedAt: Date.now(),
  };

  localStorage.setItem(
    getCacheKey(languageCode),
    JSON.stringify(cache),
  );
}

export function removeCachedTranslations(
  languageCode: string,
): void {
  localStorage.removeItem(
    getCacheKey(languageCode),
  );
}

export function clearTranslationCache(): void {
  Object.keys(localStorage)
    .filter((key) =>
      key.startsWith(TRANSLATION_PREFIX),
    )
    .forEach((key) =>
      localStorage.removeItem(key),
    );
}