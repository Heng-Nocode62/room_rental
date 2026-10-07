import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { runtimeTranslationApi } from "./api";

import {
  getCachedTranslations,
  getStoredLanguage,
  saveCachedTranslations,
  setStoredLanguage,
} from "./storage";

let initialized = false;

const DEFAULT_LANGUAGE = "en";

const DEFAULT_TRANSLATIONS: Record<string, string> = {
  "navigation.groups.operations": "Operations",
  "navigation.groups.workspace": "Workspace",
  "navigation.groups.administration": "Administration",
  "navigation.dashboard": "Dashboard",
  "navigation.availability": "Availability",
  "navigation.reservations": "Reservations",
  "navigation.rooms": "Rooms",
  "navigation.roomBlocks": "Room blocks",
  "navigation.locations": "Locations",
  "navigation.roomTypes": "Room types",
  "navigation.amenities": "Amenities",
  "navigation.pricing": "Pricing",
  "navigation.users": "Users",
  "navigation.roles": "Roles",
  "navigation.auditLogs": "Audit logs",
  "navigation.languages": "Languages",
  "navigation.settings": "Settings",
};

export async function initI18n(): Promise<void> {
  if (initialized) {
    return;
  }

  const language = getStoredLanguage(DEFAULT_LANGUAGE);

  const cached = getCachedTranslations(language);

  await i18n.use(initReactI18next).init({
    lng: language,

    fallbackLng: DEFAULT_LANGUAGE,

    resources: {
      [language]: {
        translation: { ...DEFAULT_TRANSLATIONS, ...(cached?.translations ?? {}) },
      },
    },

    interpolation: {
      escapeValue: false,
    },

    returnNull: false,

    returnEmptyString: false,
  });

  initialized = true;

  // Load latest translations
  // after the application can start.
  void refreshTranslations(language);
}

export async function refreshTranslations(languageCode: string): Promise<void> {
  const [translations, version] = await Promise.all([
    runtimeTranslationApi.get(languageCode),

    runtimeTranslationApi.getVersion(languageCode).catch(() => undefined),
  ]);

  i18n.addResourceBundle(languageCode, "translation", translations, true, true);

  saveCachedTranslations(languageCode, translations, version);

  setStoredLanguage(languageCode);

  if (i18n.language !== languageCode) {
    await i18n.changeLanguage(languageCode);
  }
}

export async function changeAppLanguage(languageCode: string): Promise<void> {
  /*
   * First use cached translations
   * so the UI changes immediately.
   */

  const cached = getCachedTranslations(languageCode);

  if (cached) {
    i18n.addResourceBundle(
      languageCode,
      "translation",
      cached.translations,
      true,
      true,
    );
  }

  await i18n.changeLanguage(languageCode);

  setStoredLanguage(languageCode);

  /*
   * Then get the latest data
   * from Spring Boot.
   */

  try {
    await refreshTranslations(languageCode);
  } catch (error) {
    console.error(`Failed to load ${languageCode} translations`, error);

    /*
     * Cached translation remains available.
     */
  }
}

export { i18n };

export default i18n;
