import { Menu, X } from "../ui/MaterialIcon.tsx";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import logo from '../../assets/logo.svg';
import LanguageSwitcher from "../../features/settings/LanguageSwitcher";
import { useAppConfig } from "../../features/settings/context/AppConfigProvider";
import HorizontalNav from "./HorizontalNav";
import MobileMenu from "./MobileMenu";
import UserMenu from "./UserMenu";

export default function HorizontalHeader() {
  const { config } = useAppConfig();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur transition-shadow ${
        scrolled ? "shadow-sm shadow-slate-900/5" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Menu toggle: below lg the nav lives in a panel under the bar */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((value) => !value)}
          className="-ml-2 rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30">
             <img src={logo} alt="Room Rental logo" className="w-10 h-10" />
          </div>

          <p className="hidden text-[15px] font-semibold tracking-tight text-slate-900 sm:block">
            {config.app.appName}
          </p>
        </div>

        <div className="hidden h-6 w-px bg-slate-200 lg:block" />

        <HorizontalNav />

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <UserMenu />
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-menu"
          className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 sm:px-6 lg:hidden"
        >
          <MobileMenu />
        </div>
      )}
    </header>
  );
}
