import {
  createContext,
  useContext,
  useLayoutEffect,
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
  createContext<UserThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "user-theme";

function getInitialTheme(): UserTheme {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "dark" ? "dark" : "light";
}

export function UserThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<UserTheme>(getInitialTheme);

  /*
   * The admin ThemeProvider sets html[data-theme] and the global stylesheet
   * uses that attribute to recolor generic surfaces. The user theme therefore
   * needs to temporarily own both the class and the data-theme attribute while
   * the user portal is mounted. On leaving /user/*, restore the admin's values.
   */
  useLayoutEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    const previousRootTheme = root.getAttribute("data-theme");
    const previousBodyTheme = body.getAttribute("data-theme");
    const previousColorScheme = root.style.colorScheme;
    const previousDarkClass = root.classList.contains("dark");

    root.dataset.theme = theme;
    body.dataset.theme = theme;
    root.style.colorScheme = theme;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(STORAGE_KEY, theme);

    return () => {
      if (previousRootTheme === null) {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", previousRootTheme);
      }

      if (previousBodyTheme === null) {
        body.removeAttribute("data-theme");
      } else {
        body.setAttribute("data-theme", previousBodyTheme);
      }

      root.style.colorScheme = previousColorScheme;
      root.classList.toggle("dark", previousDarkClass);
    };
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((current) => (current === "dark" ? "light" : "dark"));
  };

  const setTheme = (nextTheme: UserTheme) => {
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
  const context = useContext(UserThemeContext);

  if (!context) {
    throw new Error("useUserTheme must be used inside UserThemeProvider");
  }

  return context;
}
