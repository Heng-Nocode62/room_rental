import { useState } from "react";

interface Props {
  /** Either an image URL (http(s), /path, data:image) or an emoji flag such as 🇬🇧. */
  flag?: string | null;
  title?: string;
  size?: "sm" | "md";
}

const IMAGE_SRC = /^(https?:)?\/\/|^\/|^data:image\//i;

const sizes = {
  sm: { box: "h-4 w-6 rounded-[3px]", emoji: "text-base" },
  md: { box: "h-8 w-12 rounded-md", emoji: "text-2xl" },
};

/** Renders a language flag whether it is stored as an image URL or an emoji. */
export function LanguageFlag({ flag, title = "", size = "md" }: Props) {
  const [broken, setBroken] = useState(false);
  const value = flag?.trim();
  const s = sizes[size];

  if (!value || (broken && IMAGE_SRC.test(value))) {
    return (
      <span
        aria-hidden="true"
        className={`flex ${s.box} shrink-0 items-center justify-center bg-slate-100 text-xs text-slate-400 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700`}
      >
        —
      </span>
    );
  }

  if (IMAGE_SRC.test(value)) {
    return (
      <img
        src={value}
        alt={title ? `${title} flag` : ""}
        loading="lazy"
        onError={() => setBroken(true)}
        className={`${s.box} shrink-0 object-cover shadow-sm ring-1 ring-black/10 dark:ring-white/10`}
      />
    );
  }

  // Emoji (or any plain text) flag.
  return (
    <span
      role="img"
      aria-label={title ? `${title} flag` : "flag"}
      className={`flex ${s.box} shrink-0 items-center justify-center ${s.emoji} leading-none`}
    >
      {value}
    </span>
  );
}