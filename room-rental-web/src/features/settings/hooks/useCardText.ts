import { useQuery } from "@tanstack/react-query";

import { configApi } from "../api/configApi";
import { configKeys } from "./configKeys";

export function useCardText() {
  return useQuery({
    queryKey: configKeys.cardText(),
    queryFn: configApi.getCardText,
    staleTime: 60 * 1000,
  });
}
