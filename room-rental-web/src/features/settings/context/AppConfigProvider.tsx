import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";

import { useGlobalConfig } from "../hooks/useGlobalConfig";
import type { GlobalSetting } from "../types/config";

interface AppConfigContextValue {
  config: GlobalSetting;
  isLoading: boolean;
  isError: boolean;
}

const defaultConfig: GlobalSetting = {
  app: {
    appName: "Room Rental",
    layout: "vertical",
    skin: "default",
  },
  datetime: {
    active: 1,
  },
  font: {
    active: 1,
  },
  editApprovedReport: {
    enabled: true,
    windowMinutes: 120,
  },
};

const AppConfigContext = createContext<AppConfigContextValue | null>(null);

const FONT_FAMILY_BY_ID: Record<number, string> = {
  1: '"Siemreap", "Noto Sans Khmer", sans-serif',
  2: '"Noto Sans Khmer", sans-serif',
  3: '"Hanuman", "Noto Sans Khmer", sans-serif',
  4: '"Suwannaphum", "Noto Sans Khmer", sans-serif',
  5: '"Nokora", "Noto Sans Khmer", sans-serif',
  6: '"Kantumruy Pro", "Noto Sans Khmer", sans-serif',
};

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isError } = useGlobalConfig();
  const config = data ?? defaultConfig;

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.dataset.layout = config.app.layout;
    root.dataset.skin = config.app.skin;
    root.dataset.font = String(config.font.active);

    root.style.setProperty(
      "--app-font-family",
      FONT_FAMILY_BY_ID[config.font.active] ?? FONT_FAMILY_BY_ID[1],
    );

    document.title = config.app.appName || "Room Rental";

    body.dataset.layout = config.app.layout;
    body.dataset.skin = config.app.skin;
  }, [config]);

  return (
    <AppConfigContext.Provider
      value={{
        config,
        isLoading,
        isError,
      }}
    >
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  const context = useContext(AppConfigContext);

  if (!context) {
    throw new Error("useAppConfig must be used inside AppConfigProvider");
  }

  return context;
}
