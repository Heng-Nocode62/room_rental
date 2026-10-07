import { api } from "../../../lib/axios";
import type { AuditPageResponse } from "../types/auditPagination";
import type { ActivityLogResponse, ActivityLogSearchParams } from "../types/activityLog";
import type { ModelLogResponse, ModelLogSearchParams } from "../types/auditLog";

/** Converts a 1-indexed UI page to the 0-indexed page the backend expects. */
const toApiPage = (page?: number) => (page && page > 0 ? page - 1 : 0);

export const auditApi = {
  async modelLogs(
    params: ModelLogSearchParams,
  ): Promise<AuditPageResponse<ModelLogResponse>> {
    const { data } = await api.get<AuditPageResponse<ModelLogResponse>>(
      "/audit/model-logs",
      {
        params: {
          userId: params.userId,
          modelType: params.modelType,
          modelId: params.modelId,
          event: params.event,
          different: params.different,
          search: params.search,
          from: params.from,
          to: params.to,
          page: toApiPage(params.page),
          size: params.size ?? 20,
          sortBy: params.sortBy,
          direction: params.direction,
        },
      },
    );
    return data;
  },

  async activityLogs(
    params: ActivityLogSearchParams,
  ): Promise<AuditPageResponse<ActivityLogResponse>> {
    const { data } = await api.get<AuditPageResponse<ActivityLogResponse>>(
      "/audit/activity-logs",
      {
        params: {
          userId: params.userId,
          method: params.method,
          responseStatus: params.responseStatus,
          search: params.search,
          from: params.from,
          to: params.to,
          page: toApiPage(params.page),
          size: params.size ?? 20,
          sortBy: params.sortBy,
          direction: params.direction,
        },
      },
    );
    return data;
  },
};