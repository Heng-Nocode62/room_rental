import { Badge } from "../../../components/ui";
import type { RoomStatus } from "../types/room";

export function RoomStatusBadge({
  status,
}: {
  status: RoomStatus | string;
}) {
  const variant =
    status === "ACTIVE"
      ? "success"
      : status === "MAINTENANCE"
        ? "warning"
        : "neutral";

  return <Badge variant={variant}>{status}</Badge>;
}
