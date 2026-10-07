import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { auditApi } from "../api/auditApi";
import { auditKeys } from "./auditKeys";
import type { ModelLogSearchParams } from "../types/auditLog";

export function useModelLogs(params: ModelLogSearchParams) {
  return useQuery({
    queryKey: auditKeys.modelLogList(params),
    queryFn: () => auditApi.modelLogs(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}