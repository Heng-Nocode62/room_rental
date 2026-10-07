// src/features/reservations/components/ReservationStatusBadge.tsx

import { Badge } from "../../../components/ui";

interface ReservationStatusBadgeProps {
  status: string;
}

export function ReservationStatusBadge({
  status,
}: ReservationStatusBadgeProps) {
  const variant =
    status === "CONFIRMED"
      ? "success"
      : status === "CHECKED_IN"
        ? "success"
        : status === "CANCELLED"
          ? "danger"
          : status === "CHECKED_OUT"
            ? "neutral"
            : "warning";

  return <Badge variant={variant}>{status}</Badge>;
}
