import { Edit3, Eye, Power, Tag } from "../../../components/ui/MaterialIcon.tsx";

import {
  ActionMenu,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../../components/ui";

import type { RoomResponse } from "../types/room";
import { formatPrice, priceUnitLabel } from "../utils/roomUtils";
import { RoomStatusBadge } from "./RoomStatusBadge";

interface Props {
  rooms: RoomResponse[];
  onView: (item: RoomResponse) => void;
  onEdit: (item: RoomResponse) => void;
  onAmenities: (item: RoomResponse) => void;
  onToggle: (item: RoomResponse) => void;
}

export function RoomTable({
  rooms,
  onView,
  onEdit,
  onAmenities,
  onToggle,
}: Props) {
  const menuItems = (room: RoomResponse) => [
    {
      label: "View details",
      icon: <Eye size={15} />,
      onClick: () => onView(room),
    },
    {
      label: "Edit",
      icon: <Edit3 size={15} />,
      onClick: () => onEdit(room),
    },
    {
      label: "Manage amenities",
      icon: <Tag size={15} />,
      onClick: () => onAmenities(room),
    },
    ...(room.status === "ACTIVE"
      ? [
          {
            label: "Deactivate",
            icon: <Power size={15} />,
            tone: "danger" as const,
            dividerBefore: true,
            onClick: () => onToggle(room),
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden md:block">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Room</TableHeaderCell>
              <TableHeaderCell>Location & type</TableHeaderCell>
              <TableHeaderCell>Capacity</TableHeaderCell>
              <TableHeaderCell>Prices</TableHeaderCell>
              <TableHeaderCell>Amenities</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="w-20 text-right">
                Actions
              </TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id} className="hover:bg-slate-50/80">
                <TableCell>
                  <button
                    type="button"
                    onClick={() => onView(room)}
                    className="group flex items-center gap-3 text-left"
                  >
                    <span className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-slate-900 px-2 text-xs font-semibold text-white">
                      {room.roomNumber}
                    </span>

                    <span>
                      <span className="block font-semibold text-slate-900 group-hover:underline">
                        {room.name}
                      </span>
                      <span className="block text-xs text-slate-500">
                        Floor {room.floor || "—"}
                      </span>
                    </span>
                  </button>
                </TableCell>

                <TableCell>
                  <p className="text-sm text-slate-800">{room.locationName}</p>
                  <p className="text-xs text-slate-500">{room.roomTypeName}</p>
                </TableCell>

                <TableCell>
                  <span className="text-sm text-slate-700">
                    {room.capacity} {room.capacity === 1 ? "person" : "people"}
                  </span>
                </TableCell>

                <TableCell>
                  <Prices room={room} />
                </TableCell>

                <TableCell>
                  <AmenityChips room={room} />
                </TableCell>

                <TableCell>
                  <RoomStatusBadge status={room.status} />
                </TableCell>

                <TableCell className="text-right">
                  <ActionMenu items={menuItems(room)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="space-y-3 p-3 md:hidden">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => onView(room)}
                className="flex min-w-0 items-center gap-3 text-left"
              >
                <span className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-slate-900 px-2 text-xs font-semibold text-white">
                  {room.roomNumber}
                </span>

                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-900">
                    {room.name}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {room.locationName} · {room.roomTypeName}
                  </span>
                </span>
              </button>

              <ActionMenu items={menuItems(room)} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
              <RoomStatusBadge status={room.status} />
              <span>
                {room.capacity} {room.capacity === 1 ? "person" : "people"}
              </span>
              <span>Floor {room.floor || "—"}</span>
            </div>

            <div className="mt-3">
              <Prices room={room} />
            </div>

            {room.amenities.length > 0 && (
              <div className="mt-3">
                <AmenityChips room={room} />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function Prices({ room }: { room: RoomResponse }) {
  if (!room.prices.length) {
    return <span className="text-xs text-slate-400">Not set</span>;
  }

  return (
    <div className="space-y-0.5">
      {room.prices.map((price) => {
        const unit = priceUnitLabel(price.pricingUnitCode);

        return (
          <p
            key={`${price.pricingUnitCode}-${price.currencyCode}`}
            className="text-sm text-slate-800"
          >
            <span className="font-semibold">{formatPrice(price)}</span>
            <span className="text-xs text-slate-500">
              {" "}
              / {unit ?? "unit not set"}
            </span>
          </p>
        );
      })}
    </div>
  );
}

function AmenityChips({ room }: { room: RoomResponse }) {
  if (!room.amenities.length) {
    return <span className="text-xs text-slate-400">None</span>;
  }

  const extra = room.amenities.slice(2);

  return (
    <div className="flex max-w-56 flex-wrap items-center gap-1">
      {room.amenities.slice(0, 2).map((amenity) => (
        <span
          key={amenity.amenityId}
          className="rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700"
        >
          {amenity.name} × {amenity.amount}
        </span>
      ))}

      {extra.length > 0 && (
        <span
          title={extra.map((amenity) => amenity.name).join(", ")}
          className="text-xs font-medium text-slate-500"
        >
          +{extra.length}
        </span>
      )}
    </div>
  );
}