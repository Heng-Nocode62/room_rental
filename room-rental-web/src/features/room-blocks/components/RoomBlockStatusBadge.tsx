// src/features/room-blocks/components/RoomBlockStatusBadge.tsx

import { Badge } from "../../../components/ui";

import type { RoomBlockStatus } from "../types/roomBlock";

interface RoomBlockStatusBadgeProps {
  status: RoomBlockStatus;
}

export function RoomBlockStatusBadge({ status }: RoomBlockStatusBadgeProps) {
  const variant =
    status === "ACTIVE"
      ? "warning"
      : status === "COMPLETED"
        ? "success"
        : "neutral";

  return <Badge variant={variant}>{status}</Badge>;
}
