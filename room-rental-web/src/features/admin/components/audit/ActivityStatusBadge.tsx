import { Badge, type BadgeVariant } from "../../../../components/ui/index.ts";

function variantFor(status: number): BadgeVariant {
  if (status >= 500) return "danger";
  if (status >= 400) return "warning";
  if (status >= 200 && status < 300) return "success";
  return "neutral";
}

export function ActivityStatusBadge({ status }: { status: number }) {
  return <Badge variant={variantFor(status)}>{status}</Badge>;
}