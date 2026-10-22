import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { coreApi } from "./lib/axios";

const LANGUAGE_STORAGE_KEY = "app.language";
const TRANSLATION_CACHE_PREFIX = "app.translations.";

const DEFAULT_LANGUAGE = "en";

export function getCurrentLanguage() {
  return (
    localStorage.getItem(LANGUAGE_STORAGE_KEY) ||
    DEFAULT_LANGUAGE
  );
}


export function saveCurrentLanguage(languageCode) {
  localStorage.setItem(
    LANGUAGE_STORAGE_KEY,
    languageCode
  );
}


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


export async function loadTranslations(
  languageCode
) {
  const response =
    await coreApi.get(
      `/translate/${encodeURIComponent(languageCode)}`
    );

  const body = response.data;


  const translations =
    body?.data ?? {};


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


export async function changeLanguage(
  languageCode
) {



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



  try {

    const result =
      await loadTranslations(
        languageCode
      );


    i18n.addResourceBundle(
      languageCode,
      "translation",
      result.translations,
      true,
      true
    );


    await i18n.changeLanguage(
      languageCode
    );

    saveCurrentLanguage(
      languageCode
    );


  } catch (error) {

    console.error(
      `Failed to load ${languageCode} translations:`,
      error
    );

    if (!cached) {
      throw error;
    }
  }
}

export async function initI18n() {

  const language =
    getCurrentLanguage();

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