import { Badge, type BadgeVariant } from "../../../../components/ui/index.ts";

const VARIANTS: Record<string, BadgeVariant> = {
  GET: "info",
  POST: "success",
  PUT: "warning",
  PATCH: "warning",
  DELETE: "danger",
};

export function MethodBadge({ method }: { method: string }) {
  return (
    <Badge variant={VARIANTS[method.toUpperCase()] ?? "neutral"}>
      {method.toUpperCase()}
    </Badge>
  );
}