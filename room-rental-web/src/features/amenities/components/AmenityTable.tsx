import { Edit3, Eye, Power } from "../../../components/ui/MaterialIcon.tsx";

import {
  ActionMenu,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../../components/ui";

import type { AmenityResponse } from "../types/amenity";
import { AmenityStatusBadge } from "./AmenityStatusBadge";
import type { LocationOption } from "./AmenityForm";

interface Props {
  amenities: AmenityResponse[];
  locations: LocationOption[];
  onView: (item: AmenityResponse) => void;
  onEdit: (item: AmenityResponse) => void;
  onToggle: (item: AmenityResponse) => void;
}

export function AmenityTable({
  amenities,
  locations,
  onView,
  onEdit,
  onToggle,
}: Props) {
  const getLocationName = (locationId: number) =>
    locations.find((location) => location.id === locationId)?.name ??
    `#${locationId}`;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Amenity</TableHeaderCell>
          <TableHeaderCell>Location</TableHeaderCell>
          <TableHeaderCell>Description</TableHeaderCell>
          <TableHeaderCell>Price</TableHeaderCell>
          <TableHeaderCell>Stock</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell className="w-20 text-right">Actions</TableHeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {amenities.map((item) => (
          <TableRow key={item.id} className="hover:bg-slate-50/80">
            <TableCell>
              <div>
                <p className="font-semibold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-400">#{item.id}</p>
              </div>
            </TableCell>

            <TableCell>
              <span className="font-medium text-slate-700">
                {getLocationName(item.locationId)}
              </span>
            </TableCell>

            <TableCell>
              <span className="block max-w-sm truncate text-slate-500">
                {item.description || "—"}
              </span>
            </TableCell>

            <TableCell>
              <span className="font-medium text-slate-800">
                {Number(item.price).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </TableCell>

            <TableCell>
              <span
                className={
                  item.stockQuantity === 0
                    ? "font-semibold text-red-600"
                    : "font-medium text-slate-700"
                }
              >
                {item.stockQuantity}
              </span>
            </TableCell>

            <TableCell>
              <AmenityStatusBadge status={item.status} />
            </TableCell>

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
                  ...(item.status === "ACTIVE"
                    ? [
                        {
                          label: "Deactivate",
                          icon: <Power size={15} />,
                          tone: "danger" as const,
                          onClick: () => onToggle(item),
                          dividerBefore: true,
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
