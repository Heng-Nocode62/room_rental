import { useQuery } from "@tanstack/react-query";

import { configApi } from "../api/configApi";
import { configKeys } from "./configKeys";

export function useRootUserConfig() {
  return useQuery({
    queryKey: configKeys.rootUser(),
    queryFn: configApi.getRootUserConfig,
    staleTime: 60 * 1000,
  });
}
