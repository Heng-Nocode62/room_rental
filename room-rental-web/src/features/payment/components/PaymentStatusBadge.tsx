import { Badge } from "../../../components/ui";
import type { PaymentStatus } from "../types/payment";

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const variant =
    status === "SUCCESS"
      ? "success"
      : status === "FAILED" || status === "CANCELLED" || status === "EXPIRED"
        ? "danger"
        : "neutral";

  return <Badge variant={variant}>{status.replaceAll("_", " ")}</Badge>;
}
