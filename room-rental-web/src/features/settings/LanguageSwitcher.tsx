import {
  useTranslation,
} from "react-i18next";


import { useLanguages } from "../languages/hooks/useLanguages";

// The i18n implementation is JavaScript and currently has no declaration file.
// @ts-expect-error TS7016: missing declaration for the JavaScript module.
import { changeLanguage } from "../../i18n";


export default function LanguageSwitcher() {

  const {
    i18n,
  } = useTranslation();

  const {
    data: languagesResponse,
    isLoading,
  } = useLanguages();

  const languages = languagesResponse?.data ?? [];

  if (isLoading) {
    return (
      <select disabled>
        <option>
          Loading...
        </option>
      </select>
    );
  }

  return (
    <select
      value={i18n.language}
      onChange={(event) => {

        void changeLanguage(
          event.target.value,
        );

      }}
    >

      {languages.map(
        (language) => (

          <option
            key={language.id}
            value={language.code}
          >

            {language.flag
              ? `${language.flag} `
              : ""}

            {language.title}

          </option>

        ),
      )}

    </select>
  );
}