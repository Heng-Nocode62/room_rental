import { Link } from "react-router-dom";

import type { RoomResponse } from "../../rooms/types/room";
import type { RoomTypeResponse } from "../../room-types/types/roomType";

import {
  Icon,
  RoomPlaceholder,
} from "./UserUI";

export function RoomCard({
  room,
  roomType,
}: {
  room: RoomResponse;
  roomType?: RoomTypeResponse;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900">
      <Link to={`/user/rooms/${room.id}`}>
        <div className="relative aspect-[1.55] overflow-hidden">
          {roomType?.imageUrl ? (
            <img
              src={roomType.imageUrl}
              alt={roomType.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <RoomPlaceholder className="h-full w-full" />
          )}

          <div className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-600 shadow-sm backdrop-blur dark:bg-slate-950/80 dark:text-slate-200">
            <Icon name="heart" size={16} />
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  {roomType?.name ?? room.roomTypeName}
                </p>

                <h3 className="mt-1 font-bold text-slate-950 dark:text-white">
                  {room.name}
                </h3>
              </div>

              <div className="text-right">
                <p className="text-base font-extrabold text-slate-950 dark:text-white">
                  {formatStartingPrice(room)}
                </p>
                <p className="text-[11px] text-slate-400">
                  per hour
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Icon name="users" size={14} />
              {room.capacity} people
            </span>

            <span className="inline-flex items-center gap-1">
              <Icon name="building" size={14} />
              Floor {room.floor ?? "—"}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {room.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity.amenityId}
                className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {amenity.name}
              </span>
            ))}

            {room.amenities.length > 3 && (
              <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                +{room.amenities.length - 3}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <Link
          to={`/user/rooms/${room.id}`}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          View details
          <Icon name="arrow-right" size={16} />
        </Link>
      </div>
    </article>
  );
}

function formatStartingPrice(room: RoomResponse) {
  const hourly = room.prices.find(
    (price) => price.pricingUnitCode === "HOURLY",
  );

  if (!hourly) return "—";

  return `${hourly.price.toFixed(2)} ${hourly.currencyCode}`;
}