import { Badge } from "../../../components/ui";

import type { UserStatus } from "../types/user";

type Variant = "success" | "warning" | "danger" | "neutral";

const VARIANTS: Record<string, Variant> = {
  ACTIVE: "success",
  PENDING: "warning",
  LOCKED: "warning",
  INACTIVE: "neutral",
  DEACTIVATED: "danger",
};

const LABELS: Record<string, string> = {
  ACTIVE: "Active",
  PENDING: "Pending",
  LOCKED: "Locked",
  INACTIVE: "Inactive",
  DEACTIVATED: "Deactivated",
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const key = String(status);

  return (
    <Badge variant={VARIANTS[key] ?? "neutral"}>{LABELS[key] ?? key}</Badge>
  );
}