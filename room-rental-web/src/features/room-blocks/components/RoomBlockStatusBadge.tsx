import { Badge } from "../../../components/ui";

import type { RoomBlockStatus } from "../types/roomBlock";

interface RoomBlockStatusBadgeProps {
  status: RoomBlockStatus;
}

const LABELS: Record<string, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const DOTS: Record<string, string> = {
  ACTIVE: "bg-amber-500",
  COMPLETED: "bg-emerald-500",
};

export function RoomBlockStatusBadge({ status }: RoomBlockStatusBadgeProps) {
  const key = String(status);

  const variant =
    key === "ACTIVE" ? "warning" : key === "COMPLETED" ? "success" : "neutral";

  return (
    <Badge variant={variant}>
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${DOTS[key] ?? "bg-slate-400"}`}
        />
        {LABELS[key] ?? key}
      </span>
    </Badge>
  );
}