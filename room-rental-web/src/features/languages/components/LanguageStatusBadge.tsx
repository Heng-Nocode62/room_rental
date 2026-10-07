import { Badge } from "../../../components/ui";

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
