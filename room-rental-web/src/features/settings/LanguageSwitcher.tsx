import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useLanguages } from "../languages/hooks/useLanguages";

// The i18n implementation is JavaScript and currently has no declaration file.
// @ts-expect-error TS7016: missing declaration for the JavaScript module.
import { changeLanguage } from "../../i18n";

function Flag({ src, alt }: { src?: string | null; alt: string }) {
  if (!src) {
    return (
      <span
        aria-hidden="true"
        className="inline-block h-4 w-6 shrink-0 rounded-[3px] bg-slate-200 dark:bg-slate-700"
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="h-4 w-6 shrink-0 rounded-[3px] object-cover shadow-sm ring-1 ring-black/10 dark:ring-white/10"
    />
  );
}

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { data: languagesResponse, isLoading } = useLanguages();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const languages = languagesResponse?.data ?? [];

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const triggerClass =
    "flex h-8 items-center gap-2 rounded-full px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-200 dark:hover:bg-slate-700";

  if (isLoading) {
    return (
      <button type="button" disabled className={triggerClass}>
        <span className="inline-block h-4 w-6 animate-pulse rounded-[3px] bg-slate-200 dark:bg-slate-700" />
        <span className="text-slate-400">Loading…</span>
      </button>
    );
  }

  const current =
    languages.find((language) => language.code === i18n.language) ??
    languages.find(
      (language) => language.code === i18n.language?.split("-")[0],
    );

  const handleSelect = (code: string) => {
    setOpen(false);
    void changeLanguage(code);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={triggerClass}
      >
        <Flag src={current?.flag} alt="" />
        <span>{current?.title ?? i18n.language}</span>

        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 text-slate-400 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-40 mt-2 max-h-72 w-52 origin-top-right overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-900"
        >
          {languages.map((language) => {
            const selected = language.code === current?.code;

            return (
              <li key={language.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => handleSelect(language.code)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors focus:outline-none ${
                    selected
                      ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                      : "text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:bg-slate-800"
                  }`}
                >
                  <Flag src={language.flag} alt="" />
                  <span className="flex-1 truncate">{language.title}</span>

                  {selected && (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}