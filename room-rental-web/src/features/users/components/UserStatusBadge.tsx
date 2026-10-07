import { Badge } from "../../../components/ui";

import type { UserStatus } from "../types/user";

export function UserStatusBadge({ status }: { status: UserStatus }) {
  let variant: "success" | "warning" | "danger" | "neutral";

  switch (status) {
    case "ACTIVE":
      variant = "success";
      break;

    case "LOCKED":
      variant = "warning";
      break;

    case "INACTIVE":
      variant = "neutral";
      break;

    default:
      variant = "neutral";
  }

  return <Badge variant={variant}>{status}</Badge>;
}
