import { Link } from "react-router-dom";

import type { LocationResponse } from "../../locations/types/location";

import { Icon, cn } from "./UserUI";

export function LocationCard({ location }: { location: LocationResponse }) {
  return (
    <Link
      to={`/user/rooms?locationId=${location.id}`}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6",
        "min-h-[170px]",
        // Gradient background
        "border border-slate-200 bg-white",
        "shadow-sm",
        // Hover: lift + slight color shift
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        // Dark mode — deepen slightly
        "dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20",
      )}
    >
      {/* Decorative circle */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-blue-500/5 transition-transform duration-500 group-hover:scale-110" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-blue-500/5 transition-transform duration-500 group-hover:scale-110" />

      {/* Top section */}
      <div className="relative">
        {/* Icon + rooms badge row */}
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <Icon name="building" size={22} />
          </div>

          {/* Total rooms badge */}
          {location.totalRooms != null && (
            <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Icon name="door-open" size={13} />
              {location.totalRooms} rooms
            </span>
          )}
        </div>

        {/* Location name */}
        <h3 className="mt-4 text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
          {location.name}
        </h3>

        {/* Code / subtitle */}
        {location.code && (
          <p className="mt-0.5 text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {location.code}
          </p>
        )}
      </div>

      {/* Bottom section */}
      <div className="relative mt-5 space-y-1.5">
        {/* Address */}
        {location.address && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Icon name="map-pin" size={13} />
            <span className="truncate">{location.address}</span>
          </div>
        )}

        {/* Timezone */}
        {location.timezone && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Icon name="clock" size={13} />
            <span>{location.timezone}</span>
          </div>
        )}

        {/* CTA row */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Explore rooms</span>
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
  );
}