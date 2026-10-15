import {
  CalendarClock,
  Edit3,
  Eye,
  Power,
} from "../../../components/ui/MaterialIcon.tsx";
import {
  ActionMenu,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "../../../components/ui";
import type { LocationResponse } from "../types/location";
import { LocationStatusBadge } from "./LocationStatusBadge";
import { useUser } from "../../users/hooks/useUser.ts";
interface Props {
  locations: LocationResponse[];
  onView: (item: LocationResponse) => void;
  onEdit: (item: LocationResponse) => void;
  onHours: (item: LocationResponse) => void;
  onToggle: (item: LocationResponse) => void;
}
export function LocationTable({
  locations,
  onView,
  onEdit,
  onHours,
  onToggle,
}: Props) {
  const getOwnerEmail = (id: number): String => {
    const { data: user, isLoading, isError } = useUser(id);

    if (isLoading) {
      return "Loading user profile...";
    }

    if (isError) {
      return "Error loading user";
    }

    // Handle case where user isn't found or returns null
    if (!user) {
      return "User not found";
    }
    return user.email!;
  };
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Location</TableHeaderCell>
          <TableHeaderCell>Total Rooms</TableHeaderCell>
          <TableHeaderCell>Code</TableHeaderCell>
          <TableHeaderCell>Owner</TableHeaderCell>
          <TableHeaderCell>Timezone</TableHeaderCell>
          <TableHeaderCell>Contact</TableHeaderCell>
          <TableHeaderCell>Floor</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell className="w-20 text-right">Actions</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {locations.map((item) => (
          <TableRow key={item.id} className="hover:bg-slate-50/80">
            <TableCell>
              <p className="font-semibold text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-500">
                {item.address || "No address"}
              </p>
            </TableCell>
            <TableCell>
              <span className="rounded-md bg-indigo-100 px-2 py-1 font-mono text-xs text-slate-700">
                {item.totalRooms}
              </span>
            </TableCell>
            <TableCell>
              <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                {item.code}
              </span>
            </TableCell>
            <TableCell>
              <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                {getOwnerEmail(item.ownerId)}
              </span>
            </TableCell>
            <TableCell>
              <span className="font-mono text-xs text-slate-600">
                {item.timeZone}
              </span>
            </TableCell>
            <TableCell>{item.phone || "—"}</TableCell>
            <TableCell>
              <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                {item.floor}
              </span>
            </TableCell>
            <TableCell>
              <LocationStatusBadge status={item.status} />
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
                  {
                    label: "Operating hours",
                    icon: <CalendarClock size={15} />,
                    onClick: () => onHours(item),
                  },
                  {
                    label: item.status === "ACTIVE" ? "Deactivate" : "Activate",
                    icon: <Power size={15} />,
                    tone: item.status === "ACTIVE" ? "danger" : "success",
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
