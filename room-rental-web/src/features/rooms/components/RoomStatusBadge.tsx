import { Badge } from "../../../components/ui";
import type { RoomStatus } from "../types/room";

const LABELS: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  MAINTENANCE: "Maintenance",
};

const DOTS: Record<string, string> = {
  ACTIVE: "bg-emerald-500",
  MAINTENANCE: "bg-amber-500",
};

export function RoomStatusBadge({ status }: { status: RoomStatus | string }) {
  const variant =
    status === "ACTIVE"
      ? "success"
      : status === "MAINTENANCE"
        ? "warning"
        : "neutral";

  return (
    <Badge variant={variant}>
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${DOTS[status] ?? "bg-slate-400"}`}
        />
        {LABELS[status] ?? status}
      </span>
    </Badge>
  );
}