import { useState } from "react";
import { Link } from "react-router-dom";

import type { LocationResponse } from "../../locations/types/location";

import { Icon, cn } from "./UserUI";

function getTelegramUrl(contact?: string | null): string | null {
  const value = contact?.trim();

  if (!value) {
    return null;
  }

  // Accept an existing Telegram link.
  if (/^https?:\/\/(?:www\.)?(?:t\.me|telegram\.me)\//i.test(value)) {
    return value;
  }

  // Accept a Telegram link without a protocol.
  if (/^(?:www\.)?(?:t\.me|telegram\.me)\//i.test(value)) {
    return `https://${value}`;
  }

  // Otherwise, treat the value as a Telegram username.
  const username = value.replace(/^@/, "");

  if (!username || /[\s/]/.test(username)) {
    return null;
  }

  return `https://t.me/${encodeURIComponent(username)}`;
}

function TelegramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7z" />
    </svg>
  );
}

/** Same-size image and placeholder so cards line up in a grid. Falls back if the image fails to load. */
function LocationImage({
  src,
  name,
}: {
  src?: string | null;
  name: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/5">
      {src && !failed ? (
        <img
          src={src}
          alt={`${name} location`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-blue-500 dark:text-blue-400">
          <Icon name="building" size={40} />
        </div>
      )}
    </div>
  );
}

export function LocationCard({ location }: { location: LocationResponse }) {
  const telegramUrl = getTelegramUrl(location.telegramContact);
  const timeZone = location.timeZone?.replace(/_/g, " ");

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white",
        "shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        "dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20",
      )}
    >
      <Link
        to={`/user/rooms?locationId=${location.id}`}
        className="group relative flex flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
      >
        <div className="relative">
          <LocationImage src={location.imageUrl} name={location.name} />

          {location.totalRooms != null && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur dark:bg-slate-900/85 dark:text-slate-200">
              <Icon name="door-open" size={13} />
              {location.totalRooms}{" "}
              {location.totalRooms === 1 ? "room" : "rooms"}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
            {location.name}
          </h3>

          {location.code && (
            <p className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {location.code}
            </p>
          )}

          {(location.address || timeZone) && (
            <div className="mt-3 space-y-1.5">
              {location.address && (
                <div className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Icon name="map-pin" size={13} className="mt-0.5 shrink-0" />
                  <span className="min-w-0 break-words">
                    {location.address}
                  </span>
                </div>
              )}

              {timeZone && (
                <div className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Icon name="clock" size={13} className="mt-0.5 shrink-0" />
                  <span className="min-w-0 break-words">{timeZone}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between pt-5">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Explore rooms
            </span>

            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
                "transition-all duration-200 group-hover:translate-x-1 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20",
              )}
            >
              <Icon name="arrow-right" size={16} />
            </span>
          </div>
        </div>
      </Link>

      {telegramUrl && (
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 border-t border-slate-200 px-5 py-4 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 dark:border-slate-700 dark:hover:bg-sky-500/10"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400">
            <TelegramIcon />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-sky-700 dark:text-sky-400">
              Contact owner on Telegram
            </span>
            <span className="mt-0.5 block break-all text-xs text-slate-500 dark:text-slate-400">
              Send your payment receipt · {location.telegramContact}
            </span>
          </span>
        </a>
      )}
    </div>
  );
}