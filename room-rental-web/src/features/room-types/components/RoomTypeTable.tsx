import {
  Edit3,
  Eye,
  Power,
} from "../../../components/ui/MaterialIcon.tsx";

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

interface Props {
  roomTypes: RoomTypeResponse[];

  onView: (item: RoomTypeResponse) => void;

  onEdit: (item: RoomTypeResponse) => void;

  onToggle: (item: RoomTypeResponse) => void;
}

export function RoomTypeTable({
  roomTypes,
  onView,
  onEdit,
  onToggle,
}: Props) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Image</TableHeaderCell>

          <TableHeaderCell>Type</TableHeaderCell>

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
          <TableRow
            key={item.id}
            className="hover:bg-slate-50/80"
          >
            {/* Image */}

            <TableCell>
              <div className="h-12 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                    No image
                  </div>
                )}
              </div>
            </TableCell>

            {/* Type */}

            <TableCell>
              <div>
                <p className="font-semibold text-slate-900">
                  {item.name}
                </p>

                <p className="mt-0.5 font-mono text-xs text-slate-400">
                  {item.code}
                </p>
              </div>
            </TableCell>

            {/* Capacity */}

            <TableCell>
              {item.capacity ?? "—"}
            </TableCell>

            {/* Description */}

            <TableCell>
              <span className="block max-w-lg truncate text-slate-500">
                {item.description || "—"}
              </span>
            </TableCell>

            {/* Status */}

            <TableCell>
              <RoomTypeStatusBadge status={item.status} />
            </TableCell>

            {/* Actions */}

            <TableCell className="text-right">
              <ActionMenu
                items={[
                  {
                    label: "View",
                    icon: <Eye size={15} />,
                    onClick: () => onView(item),
                  },

                  {
                    label: "Edit",
                    icon: <Edit3 size={15} />,
                    onClick: () => onEdit(item),
                  },

                  {
                    label:
                      item.status === "ACTIVE"
                        ? "Deactivate"
                        : "Activate",

                    icon: <Power size={15} />,

                    tone:
                      item.status === "ACTIVE"
                        ? "danger"
                        : "success",

                    dividerBefore: true,

                    onClick: () => onToggle(item),
                  },
                ]}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}