import { ActionMenu } from "../../../components/ui";

import type { RoomTypeResponse } from "../types/roomType";

import { RoomTypeStatusBadge } from "./RoomTypeStatusBadge";
import { getRoomTypeMenuItems, type RoomTypeActions } from "./RoomTypeMenu";

interface Props extends RoomTypeActions {
  item: RoomTypeResponse;
  locationName?: string;
}

export function RoomTypeCard({ item, locationName, ...actions }: Props) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <button
        type="button"
        onClick={() => actions.onView(item)}
        className="block overflow-hidden rounded-t-2xl text-left"
        aria-label={`View ${item.name}`}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-40 w-full object-cover"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <span className="text-4xl font-semibold text-slate-300">
              {item.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-slate-900">
              {item.name}
            </h3>

            <p className="mt-0.5 font-mono text-xs text-slate-400">
              {item.code}
            </p>
          </div>

          <ActionMenu items={getRoomTypeMenuItems(item, actions)} />
        </div>

        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
          {item.description || "No description."}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="text-xs text-slate-500">
            <p>{locationName ?? `Location #${item.locationId}`}</p>
            <p className="mt-0.5">
              {item.capacity != null
                ? `${item.capacity} ${item.capacity === 1 ? "person" : "people"}`
                : "Capacity not set"}
            </p>
          </div>

          <RoomTypeStatusBadge status={item.status} />
        </div>
      </div>
    </div>
  );
}