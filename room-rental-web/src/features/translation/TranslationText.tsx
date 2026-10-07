import { useTranslation } from "react-i18next";

interface TranslationTextProps {
  k: string;
}
export function T({
  k
}: TranslationTextProps) {
  const { t } = useTranslation();
  return <>{t(k)}</>;
}
