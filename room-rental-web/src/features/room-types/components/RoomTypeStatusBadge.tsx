import { Badge } from "../../../components/ui";

import type { RoomTypeStatus } from "../types/roomType";

interface Props {
  status: RoomTypeStatus;
}

export function RoomTypeStatusBadge({ status }: Props) {
  const variant = status === "ACTIVE" ? "success" : "neutral";

  return <Badge variant={variant}>{status}</Badge>;
}
