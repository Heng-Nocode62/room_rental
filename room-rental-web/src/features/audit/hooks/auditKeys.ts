import type { ActivityLogSearchParams } from "../types/activityLog";
import type { ModelLogSearchParams } from "../types/auditLog";

export const auditKeys = {
  all: ["audit"] as const,

  modelLogLists: () => [...auditKeys.all, "model-logs"] as const,
  modelLogList: (params: ModelLogSearchParams) =>
    [...auditKeys.modelLogLists(), params] as const,

  activityLogLists: () => [...auditKeys.all, "activity-logs"] as const,
  activityLogList: (params: ActivityLogSearchParams) =>
    [...auditKeys.activityLogLists(), params] as const,
};