import { useMutation } from "@tanstack/react-query";
import { translationApi } from "../api/translationApi";

export function useExportTranslations() {
  return useMutation({
    mutationFn: (languageIds?: number[]) => translationApi.export(languageIds),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "translations.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}
