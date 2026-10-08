import { createIcon } from "../../components/ui/MaterialIcon";
import { useTheme } from "./context/ThemeProvider";

const LightModeIcon = createIcon("light_mode");
const DarkModeIcon = createIcon("dark_mode");

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className="theme-toggle inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      {isDark ? <LightModeIcon size={19} /> : <DarkModeIcon size={19} />}
    </button>
  );
}
