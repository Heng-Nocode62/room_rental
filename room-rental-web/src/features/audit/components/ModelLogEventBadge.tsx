import { Badge, type BadgeVariant } from "../../../components/ui";
import type { ModelLogEvent } from "../types/auditLog";

const VARIANTS: Record<string, BadgeVariant> = {
  CREATE: "success",
  CREATED: "success",
  UPDATE: "info",
  UPDATED: "info",
  DELETE: "danger",
  DELETED: "danger",
};

export function ModelLogEventBadge({ event }: { event: ModelLogEvent }) {
  const key = String(event).toUpperCase();
  return <Badge variant={VARIANTS[key] ?? "neutral"}>{key}</Badge>;
}