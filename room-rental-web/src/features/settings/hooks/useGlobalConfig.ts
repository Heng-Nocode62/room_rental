import { useQuery } from "@tanstack/react-query";

import { configApi } from "../api/configApi";
import { configKeys } from "./configKeys";
import { normalizeGlobalSetting } from "../types/config";

export function useGlobalConfig() {
  return useQuery({
    queryKey: configKeys.global(),
    queryFn: configApi.getGlobalSetting,
    select: normalizeGlobalSetting,
    staleTime: 60 * 1000,
  });
}
