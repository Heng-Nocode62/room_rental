import { coreApi } from "../lib/axios";

import type {
  BackendTranslation,
  RuntimeTranslations,
  RuntimeTranslationResponse,
  RuntimeVersionResponse,
} from "./types";

export const runtimeTranslationApi = {
  async get(
    languageCode: string,
  ): Promise<RuntimeTranslations> {

    const response =
      await coreApi.get<RuntimeTranslationResponse>(
        `/translate/${encodeURIComponent(languageCode)}`,
      );

    const body = response.data;

    console.log(
      "Translation API response:",
      body,
    );

    /*
     * CASE 1
     *
     * Backend returns:
     *
     * {
     *   data: [
     *     {
     *       key: "navigation.dashboard",
     *       value: "Dashboard"
     *     }
     *   ]
     * }
     */

    if (Array.isArray(body?.data)) {

      return body.data
        .filter(
          (item: BackendTranslation) =>
            item.active !== false,
        )
        .reduce<RuntimeTranslations>(
          (result, item) => {

            result[item.key] =
              item.value;

            return result;
          },
          {},
        );
    }

    /*
     * CASE 2
     *
     * Backend returns:
     *
     * {
     *   translations: {
     *     "navigation.dashboard": "Dashboard",
     *     "common.save": "Save"
     *   }
     * }
     */

    if (
      body &&
      typeof body === "object" &&
      "translations" in body &&
      body.translations &&
      typeof body.translations === "object" &&
      !Array.isArray(body.translations)
    ) {

      return body.translations as RuntimeTranslations;
    }

    /*
     * CASE 3
     *
     * Backend returns:
     *
     * {
     *   data: {
     *     "navigation.dashboard": "Dashboard",
     *     "common.save": "Save"
     *   }
     * }
     */

    if (
      body?.data &&
      typeof body.data === "object" &&
      !Array.isArray(body.data)
    ) {

      return body.data as RuntimeTranslations;
    }

    /*
     * CASE 4
     *
     * Backend directly returns:
     *
     * {
     *   "navigation.dashboard": "Dashboard"
     * }
     */

    if (
      body &&
      typeof body === "object" &&
      !Array.isArray(body)
    ) {

      return body as RuntimeTranslations;
    }

    console.error(
      "Unknown translation API response:",
      body,
    );

    return {};
  },

  async getVersion(
    languageCode: string,
  ): Promise<string | number | undefined> {

    const response =
      await coreApi.get<RuntimeVersionResponse>(
        `/translate/${encodeURIComponent(languageCode)}/version`,
      );

    return (
      response.data?.version ??
      response.data?.data
    );
  },
};