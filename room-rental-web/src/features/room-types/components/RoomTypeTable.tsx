import {
  ActionMenu,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../../components/ui";

import type { RoomTypeResponse } from "../types/roomType";

import { RoomTypeStatusBadge } from "./RoomTypeStatusBadge";
import { getRoomTypeMenuItems } from "./RoomTypeMenu";

interface Props {
  roomTypes: RoomTypeResponse[];

  /** Optional id → name lookup so the table can show names instead of ids */
  locationNames?: Map<number, string>;

  onView: (item: RoomTypeResponse) => void;

  onEdit: (item: RoomTypeResponse) => void;

  onToggle: (item: RoomTypeResponse) => void;
}

export function RoomTypeTable({
  roomTypes,
  locationNames,
  onView,
  onEdit,
  onToggle,
}: Props) {
  const actions = { onView, onEdit, onToggle };

  const locationLabel = (item: RoomTypeResponse) =>
    locationNames?.get(item.locationId) ?? `#${item.locationId}`;

  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden md:block">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Location</TableHeaderCell>
              <TableHeaderCell>Capacity</TableHeaderCell>
              <TableHeaderCell>Description</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="w-20 text-right">
                Actions
              </TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {roomTypes.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50/80">
                <TableCell>
                  <button
                    type="button"
                    onClick={() => onView(item)}
                    className="group flex items-center gap-3 text-left"
                  >
                    <Thumb item={item} />

                    <span>
                      <span className="block font-semibold text-slate-900 group-hover:underline">
                        {item.name}
                      </span>
                      <span className="mt-0.5 block font-mono text-xs text-slate-400">
                        {item.code}
                      </span>
                    </span>
                  </button>
                </TableCell>

                <TableCell>
                  <span className="text-sm text-slate-700">
                    {locationLabel(item)}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="text-sm text-slate-700">
                    {item.capacity != null
                      ? `${item.capacity} ${item.capacity === 1 ? "person" : "people"}`
                      : "—"}
                  </span>
                </TableCell>

                <TableCell>
                  <span
                    title={item.description || undefined}
                    className="block max-w-md truncate text-sm text-slate-500"
                  >
                    {item.description || "—"}
                  </span>
                </TableCell>

                <TableCell>
                  <RoomTypeStatusBadge status={item.status} />
                </TableCell>

                <TableCell className="text-right">
                  <ActionMenu items={getRoomTypeMenuItems(item, actions)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="space-y-3 p-3 md:hidden">
        {roomTypes.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => onView(item)}
                className="flex min-w-0 items-center gap-3 text-left"
              >
                <Thumb item={item} />

                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-900">
                    {item.name}
                  </span>
                  <span className="block font-mono text-xs text-slate-400">
                    {item.code}
                  </span>
                </span>
              </button>

              <ActionMenu items={getRoomTypeMenuItems(item, actions)} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
              <RoomTypeStatusBadge status={item.status} />
              <span>{locationLabel(item)}</span>
              <span>
                {item.capacity != null ? `${item.capacity} people` : "No capacity"}
              </span>
            </div>

            {item.description && (
              <p className="mt-3 line-clamp-2 text-sm text-slate-500">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function Thumb({ item }: { item: RoomTypeResponse }) {
  return (
    <span className="block h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-300">
          {item.name.slice(0, 1).toUpperCase()}
        </span>
      )}
    </span>
  );
}