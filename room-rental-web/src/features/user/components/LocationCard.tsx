import { Link } from "react-router-dom";

import type { LocationResponse } from "../../locations/types/location";

import {
  Icon,
} from "./UserUI";

export function LocationCard({
  location,
}: {
  location: LocationResponse;
}) {
  return (
    <Link
      to={`/user/rooms?locationId=${location.id}`}
      className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <Icon name="building" size={24} />
        </div>

        <Icon
          name="arrow-right"
          size={18}
          className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600 dark:text-slate-600 dark:group-hover:text-blue-400"
        />
      </div>

      <h3 className="mt-4 font-bold text-slate-950 dark:text-white">
        {location.name}
      </h3>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {location.code}
      </p>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Icon name="building" size={14} />
        {location.totalRooms} rooms
      </div>

      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Icon name="map-pin" size={14} />
        {location.address || "Location available"}
      </div>
    </Link>
  );
}