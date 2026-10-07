
import { Badge } from "../../../components/ui";

import type { RoomPriceStatus } from "../types/roomPrice";

interface Props {
  status: RoomPriceStatus;
}

export function RoomPriceStatusBadge({ status }: Props) {
  return (
    <Badge variant={status === "ACTIVE" ? "success" : "neutral"}>
      {status}
    </Badge>
  );
}
