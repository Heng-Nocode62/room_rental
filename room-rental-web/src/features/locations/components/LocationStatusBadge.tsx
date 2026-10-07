import { Badge } from "../../../components/ui";

import type { LocationStatus } from "../types/location";

interface Props {
  status: LocationStatus;
}

export function LocationStatusBadge({ status }: Props) {
  const variant = status === "ACTIVE" ? "success" : "neutral";

  return <Badge variant={variant}>{status}</Badge>;
}
