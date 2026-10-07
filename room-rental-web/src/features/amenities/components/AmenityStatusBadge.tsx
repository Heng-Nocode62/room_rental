import { Badge } from "../../../components/ui";

import type { AmenityStatus } from "../types/amenity";

interface Props {
  status: AmenityStatus;
}

export function AmenityStatusBadge({ status }: Props) {
  return (
    <Badge variant={status === "ACTIVE" ? "success" : "neutral"}>
      {status}
    </Badge>
  );
}
