import { useQuery } from "@tanstack/react-query";

import { configApi } from "../api/configApi";
import { configKeys } from "./configKeys";

export function useUserConfig() {
  return useQuery({
    queryKey: configKeys.user(),
    queryFn: configApi.getUserConfig,
    staleTime: 60 * 1000,
  });
}
