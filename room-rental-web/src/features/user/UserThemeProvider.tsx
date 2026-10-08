import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type UserTheme = "light" | "dark";

interface UserThemeContextValue {
  theme: UserTheme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: UserTheme) => void;
}

const UserThemeContext =
  createContext<UserThemeContextValue | undefined>(
    undefined,
  );

const STORAGE_KEY = "user-theme";

export function UserThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] =
    useState<UserTheme>(() => {
      const saved = localStorage.getItem(
        STORAGE_KEY,
      );

      if (
        saved === "light" ||
        saved === "dark"
      ) {
        return saved;
      }

      return "light";
    });

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark",
    );

    localStorage.setItem(
      STORAGE_KEY,
      theme,
    );
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((current) =>
      current === "dark"
        ? "light"
        : "dark",
    );
  };

  const setTheme = (
    nextTheme: UserTheme,
  ) => {
    setThemeState(nextTheme);
  };

  return (
    <UserThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </UserThemeContext.Provider>
  );
}

export function useUserTheme() {
  const context = useContext(
    UserThemeContext,
  );

  if (!context) {
    throw new Error(
      "useUserTheme must be used inside UserThemeProvider",
    );
  }

  return context;
}