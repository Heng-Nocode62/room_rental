import { Badge } from "../../../components/ui";

import type { RoomBlockType } from "../types/roomBlock";

interface RoomBlockTypeBadgeProps {
  type: RoomBlockType;
}

export function RoomBlockTypeBadge({ type }: RoomBlockTypeBadgeProps) {
  return <Badge variant="neutral">{type.replaceAll("_", " ")}</Badge>;
}
