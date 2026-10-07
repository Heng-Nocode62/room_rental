import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { auditApi } from "../api/auditApi";
import { auditKeys } from "./auditKeys";
import type { ActivityLogSearchParams } from "../types/activityLog";

export function useActivityLogs(params: ActivityLogSearchParams) {
  return useQuery({
    queryKey: auditKeys.activityLogList(params),
    queryFn: () => auditApi.activityLogs(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}