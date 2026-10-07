import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { coreApi } from "./lib/axios";

const LANGUAGE_STORAGE_KEY = "app.language";
const TRANSLATION_CACHE_PREFIX = "app.translations.";

const DEFAULT_LANGUAGE = "en";

/**
 * Get current language
 */
export function getCurrentLanguage() {
  return (
    localStorage.getItem(LANGUAGE_STORAGE_KEY) ||
    DEFAULT_LANGUAGE
  );
}

/**
 * Save current language
 */
export function saveCurrentLanguage(languageCode) {
  localStorage.setItem(
    LANGUAGE_STORAGE_KEY,
    languageCode
  );
}

/**
 * Get cached translations
 */
function getCachedTranslations(languageCode) {
  const key =
    `${TRANSLATION_CACHE_PREFIX}${languageCode}`;

  const cached =
    localStorage.getItem(key);

  if (!cached) {
    return null;
  }

  try {
    return JSON.parse(cached);
  } catch (error) {
    console.error(
      "Invalid translation cache:",
      error
    );

    localStorage.removeItem(key);

    return null;
  }
}

/**
 * Save translations to localStorage
 */
function saveTranslationsToCache(
  languageCode,
  translations,
  version
) {
  const key =
    `${TRANSLATION_CACHE_PREFIX}${languageCode}`;

  localStorage.setItem(
    key,
    JSON.stringify({
      translations,
      version,
      cachedAt: Date.now(),
    })
  );
}

/**
 * Load translations from backend
 *
 * GET /api/translate/{languageCode}
 *
 * Response:
 *
 * {
 *   "language": "km",
 *   "title": "Khmer",
 *   "flag": null,
 *   "version": 2,
 *   "data": {
 *     "navigation.dashboard": "ផ្ទាំងគ្រប់គ្រង"
 *   }
 * }
 */
export async function loadTranslations(
  languageCode
) {
  const response =
    await coreApi.get(
      `/translate/${encodeURIComponent(languageCode)}`
    );

  const body = response.data;


  /**
   * The translations are here:
   *
   * body.data
   */
  const translations =
    body?.data ?? {};

  /**
   * Make sure data is an object.
   */
  if (
    typeof translations !== "object" ||
    Array.isArray(translations)
  ) {
    console.error(
      "Invalid translation data:",
      translations
    );

    return {
      translations: {},
      version: body?.version,
    };
  }

  /**
   * Save cache
   */
  saveTranslationsToCache(
    languageCode,
    translations,
    body?.version
  );

  return {
    translations,
    version: body?.version,
  };
}

/**
 * Change application language
 */
export async function changeLanguage(
  languageCode
) {
  console.log(
    "Changing language:",
    languageCode
  );

  /**
   * --------------------------------------------------
   * 1. Check localStorage
   * --------------------------------------------------
   */

  const cached =
    getCachedTranslations(
      languageCode
    );

  if (cached) {

    console.log(
      `Using cached ${languageCode} translations`
    );

    i18n.addResourceBundle(
      languageCode,
      "translation",
      cached.translations,
      true,
      true
    );

    await i18n.changeLanguage(
      languageCode
    );

    saveCurrentLanguage(
      languageCode
    );
  }

  /**
   * --------------------------------------------------
   * 2. Get latest translations
   * --------------------------------------------------
   */

  try {

    const result =
      await loadTranslations(
        languageCode
      );

    /**
     * Add translations to i18next
     */
    i18n.addResourceBundle(
      languageCode,
      "translation",
      result.translations,
      true,
      true
    );

    /**
     * Change language
     */
    await i18n.changeLanguage(
      languageCode
    );

    /**
     * Save selected language
     */
    saveCurrentLanguage(
      languageCode
    );

    console.log(
      "Language changed successfully:",
      i18n.language
    );

  } catch (error) {

    console.error(
      `Failed to load ${languageCode} translations:`,
      error
    );

    /**
     * If cache exists, keep using cache.
     */
    if (!cached) {
      throw error;
    }
  }
}

/**
 * Initialize i18next
 */
export async function initI18n() {

  const language =
    getCurrentLanguage();



  /**
   * Load cached translations first
   */
  const cached =
    getCachedTranslations(
      language
    );

  const resources = {};

  if (cached) {

    resources[language] = {
      translation:
        cached.translations,
    };

  }

  /**
   * Initialize i18next
   */
  await i18n
    .use(initReactI18next)
    .init({

      lng: language,

      fallbackLng:
        DEFAULT_LANGUAGE,

      resources,

      interpolation: {
        escapeValue: false,
      },

      returnNull: false,

      returnEmptyString: false,

    });

  /**
   * Get latest translations
   */
  try {

    const result =
      await loadTranslations(
        language
      );

    i18n.addResourceBundle(
      language,
      "translation",
      result.translations,
      true,
      true
    );

  } catch (error) {

    console.error(
      "Failed to load initial translations:",
      error
    );

  }

  return i18n;
}

export default i18n;