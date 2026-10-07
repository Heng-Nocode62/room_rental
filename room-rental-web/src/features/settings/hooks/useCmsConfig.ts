import { useQuery } from "@tanstack/react-query";

import { configApi } from "../api/configApi";
import { configKeys } from "./configKeys";

export function useCmsConfig() {
  return useQuery({
    queryKey: configKeys.cms(),
    queryFn: configApi.getCmsConfig,
    staleTime: 60 * 1000,
  });
}
