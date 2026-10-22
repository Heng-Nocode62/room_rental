import { Link } from "react-router-dom";
import { DateTime } from "luxon";

import type { RoomResponse } from "../../rooms/types/room";
import type { RoomTypeResponse } from "../../room-types/types/roomType";

import { Icon, RoomPlaceholder, cn } from "./UserUI";

export function RoomCard({
  room,
  roomType,
  effectiveDate,
}: {
  room: RoomResponse;
  /** Room-type image is used as a fallback when the room has no image. */
  roomType?: RoomTypeResponse;
  /** Date selected in Browse Rooms; defaults to today on the dashboard. */
  effectiveDate?: string;
}) {
  const amenities = (room.amenities ?? [])
    .map((amenity) => amenity.name)
    .filter(Boolean);
  const visibleAmenities = amenities.slice(0, 3);
  const overflowCount = amenities.length - visibleAmenities.length;

  const priceDate = effectiveDate ?? DateTime.now().toISODate() ?? "";

  const findEffectivePrice = (unitCode: "HOURLY" | "DAILY") => {
    const eligible = (room.prices ?? [])
      .filter((price) => price.pricingUnitCode.toUpperCase() === unitCode)
      .filter((price) => price.effectiveFrom <= priceDate)
      .filter((price) => !price.effectiveTo || price.effectiveTo >= priceDate)
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));

    return eligible.find((price) => price.status === "ACTIVE") ?? eligible[0];
  };

  const hourlyPrice = findEffectivePrice("HOURLY");
  const dailyPrice = findEffectivePrice("DAILY");

  return (
    <article
      className={cn(
        "group flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5",
        "dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20",
      )}
    >
      <Link to={`/user/rooms/${room.id}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
          {room.imageUrl || roomType?.imageUrl ? (
            <img
              src={room.imageUrl || roomType?.imageUrl || ""}
              alt={room.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <RoomPlaceholder className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
          )}

          <div className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-slate-500 shadow-sm backdrop-blur dark:bg-slate-950/80 dark:text-slate-300">
            <Icon name="heart" size={14} />
          </div>

          {room.capacity != null && (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur dark:bg-slate-950/85 dark:text-slate-100">
              <Icon name="users" size={12} />
              {room.capacity}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link to={`/user/rooms/${room.id}`} className="min-w-0">
          <h3 className="truncate text-sm font-bold tracking-tight text-slate-950 dark:text-white">
            {room.name}
          </h3>
          <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
            {room.locationName} · Room {room.roomNumber}
            {room.floor ? ` · Floor ${room.floor}` : ""}
          </p>
        </Link>

        {visibleAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {visibleAmenities.map((amenity, index) => (
              <span
                key={`${amenity}-${index}`}
                className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {amenity}
              </span>
            ))}
            {overflowCount > 0 && (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                +{overflowCount}
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
          <div className="min-w-0">
            {hourlyPrice ? (
              <p className="truncate text-sm font-extrabold text-slate-950 dark:text-white">
                {hourlyPrice.price.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                {hourlyPrice.currencyCode}
                <span className="ml-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  /hr
                </span>
              </p>
            ) : (
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Price unavailable
              </p>
            )}
            {dailyPrice && (
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {dailyPrice.price.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                {dailyPrice.currencyCode} / day
              </p>
            )}
          </div>

          <Link
            to={`/user/rooms/${room.id}`}
            aria-label={`View details for ${room.name}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]"
          >
            View
            <Icon name="arrow-right" size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}