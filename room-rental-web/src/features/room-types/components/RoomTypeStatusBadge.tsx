import { Badge } from "../../../components/ui";

import type { RoomTypeStatus } from "../types/roomType";

interface Props {
  status: RoomTypeStatus;
}

export function RoomTypeStatusBadge({ status }: Props) {
  const active = String(status) === "ACTIVE";

  return (
    <Badge variant={active ? "success" : "neutral"}>
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`}
        />
        {active ? "Active" : "Inactive"}
      </span>
    </Badge>
  );
}