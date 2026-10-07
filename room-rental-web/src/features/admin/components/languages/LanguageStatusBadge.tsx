import { Badge } from "../../../../components/ui/index.ts";

interface Props {
  active: boolean;
}

export function LanguageStatusBadge({ active }: Props) {
  return (
    <Badge variant={active ? "success" : "neutral"}>
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}
