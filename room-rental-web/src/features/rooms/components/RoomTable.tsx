import { CircleDollarSign, Edit3, Eye, Power, Tag } from "../../../components/ui/MaterialIcon.tsx";

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
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Room</TableHeaderCell>
          <TableHeaderCell>Location</TableHeaderCell>
          <TableHeaderCell>Type</TableHeaderCell>
          <TableHeaderCell>Floor</TableHeaderCell>
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
              <div>
                <p className="font-semibold text-slate-900">
                  {room.roomNumber}
                </p>
                <p className="text-xs text-slate-500">{room.name}</p>
              </div>
            </TableCell>

            <TableCell>{room.locationName}</TableCell>
            <TableCell>{room.roomTypeName}</TableCell>
            <TableCell>{room.floor || "—"}</TableCell>
            <TableCell>{room.capacity}</TableCell>
             <TableCell>{room.prices.map(price=>(
              <p>
                <span>{price.price + ' '}</span>
                <span>{price.currencyCode === 'USD'? "$" : price.currencyCode}</span>
                <span>{price.pricingUnitCode ==='HOURLY' ? '/hour': price.pricingUnitCode ==='DAILY' ? '/day':"not set"}</span>
              </p>
             ))}</TableCell>
            <TableCell>
              {room.amenities.length ? (
                <div className="flex max-w-56 flex-wrap gap-1">
                  {room.amenities.slice(0, 2).map((amenity) => (
                    <span
                      key={amenity.amenityId}
                      className="rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700"
                    >
                      {amenity.name} × {amenity.amount}
                    </span>
                  ))}
                  {room.amenities.length > 2 && (
                    <span className="text-xs text-slate-400">
                      +{room.amenities.length - 2}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-slate-400">None</span>
              )}
            </TableCell>

            <TableCell>
              <RoomStatusBadge status={room.status} />
            </TableCell>

            <TableCell className="text-right">
              <ActionMenu
                items={[
                  {
                    label: "View",
                    icon: <Eye size={15} />,
                    onClick: () => onView(room),
                  },
                  {
                    label: "Edit",
                    icon: <Edit3 size={15} />,
                    onClick: () => onEdit(room),
                  },
                  {
                    label: "Amenities",
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
                ]}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
