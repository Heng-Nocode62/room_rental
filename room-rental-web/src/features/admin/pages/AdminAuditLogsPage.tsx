import { useState } from "react";
import {
  Button, EmptyState, LoadingState, Pagination, PageHeader,
} from "../../../components/ui/index.ts";
import { useModelLogs } from "../../audit/hooks/useModelLogs.ts";
import { useActivityLogs } from "../../audit/hooks/useActivityLogs.ts";
import { useDebouncedValue } from "../../audit/hooks/useDebouncedValue.ts";
import { ModelLogFilters } from "../components/audit/ModelLogFilters.tsx";
import { ModelLogTable } from "../components/audit/ModelLogTable.tsx";
import { ActivityLogFilters } from "../components/audit/ActivityLogFilters.tsx";
import { ActivityLogTable } from "../components/audit/ActivityLogTable.tsx";
import { AuditSidebar, type AuditTab } from "../components/audit/AuditSidebar.tsx";

const TABS: AuditTab[] = [
  { key: "model-logs", label: "Model Logs" },
  { key: "activity-logs", label: "Activity Logs" },
];

export default function AuditLogsPage() {
  const [activeTab, setActiveTab] = useState("model-logs");

  // ---- Model logs ----
  const [modelPage, setModelPage] = useState(1);
  const [modelType, setModelType] = useState("");
  const [event, setEvent] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [modelFrom, setModelFrom] = useState("");
  const [modelTo, setModelTo] = useState("");

  const debouncedModelSearch = useDebouncedValue(modelSearch);

  const {
    data: modelPageData,
    isLoading: isModelLoading,
    isFetching: isModelFetching,
    isError: isModelError,
    refetch: refetchModelLogs,
  } = useModelLogs({
    modelType: modelType || undefined,
    event: event || undefined,
    search: debouncedModelSearch || undefined,
    from: modelFrom || undefined,
    to: modelTo || undefined,
    page: modelPage,
    size: 20,
  });

  // ---- Activity logs ----
  const [activityPage, setActivityPage] = useState(1);
  const [method, setMethod] = useState("");
  const [activitySearch, setActivitySearch] = useState("");
  const [activityFrom, setActivityFrom] = useState("");
  const [activityTo, setActivityTo] = useState("");

  const debouncedActivitySearch = useDebouncedValue(activitySearch);

  const {
    data: activityPageData,
    isLoading: isActivityLoading,
    isFetching: isActivityFetching,
    isError: isActivityError,
    refetch: refetchActivityLogs,
  } = useActivityLogs({
    method: method || undefined,
    search: debouncedActivitySearch || undefined,
    from: activityFrom || undefined,
    to: activityTo || undefined,
    page: activityPage,
    size: 20,
  });

  const modelLogs = modelPageData?.content ?? [];
  const activityLogs = activityPageData?.content ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Audit Logs"
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              activeTab === "model-logs" ? refetchModelLogs() : refetchActivityLogs()
            }
          >
            Refresh
          </Button>
        }
      />

      <div className="flex flex-col gap-6 md:flex-row">
        <AuditSidebar tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

        <div className="min-w-0 flex-1">
          {activeTab === "model-logs" && (
            <div className="space-y-4">
              <ModelLogFilters
                modelType={modelType}
                event={event}
                search={modelSearch}
                from={modelFrom}
                to={modelTo}
                onModelTypeChange={(v) => { setModelType(v); setModelPage(1); }}
                onEventChange={(v) => { setEvent(v); setModelPage(1); }}
                onSearchChange={(v) => { setModelSearch(v); setModelPage(1); }}
                onFromChange={(v) => { setModelFrom(v); setModelPage(1); }}
                onToChange={(v) => { setModelTo(v); setModelPage(1); }}
              />

              {isModelLoading && <LoadingState />}

              {isModelError && (
                <EmptyState
                  title="Unable to load model logs"
                  description="Something went wrong while loading model logs."
                  action={
                    <Button variant="secondary" onClick={() => refetchModelLogs()}>
                      Try again
                    </Button>
                  }
                />
              )}

              {!isModelLoading && !isModelError && modelLogs.length === 0 && (
                <EmptyState
                  title="No model logs"
                  description="No changes match the current filters."
                />
              )}

              {!isModelLoading && !isModelError && modelLogs.length > 0 && (
                <>
                  <div className={isModelFetching ? "opacity-60 transition-opacity" : ""}>
                    <ModelLogTable logs={modelLogs} />
                  </div>
                  <Pagination
                    pagination={{
                      page: modelPageData?.page ?? 0,
                      size: modelPageData?.size ?? 20,
                      totalElements: modelPageData?.totalElements ?? 0,
                      totalPages: modelPageData?.totalPages ?? 1,
                      first: modelPageData?.first ?? true,
                      last: modelPageData?.last ?? true,
                      empty: modelLogs.length === 0,
                    }}
                    onPageChange={(nextPage) => setModelPage(nextPage + 1)}
                  />
                </>
              )}
            </div>
          )}

          {activeTab === "activity-logs" && (
            <div className="space-y-4">
              <ActivityLogFilters
                method={method}
                search={activitySearch}
                from={activityFrom}
                to={activityTo}
                onMethodChange={(v) => { setMethod(v); setActivityPage(1); }}
                onSearchChange={(v) => { setActivitySearch(v); setActivityPage(1); }}
                onFromChange={(v) => { setActivityFrom(v); setActivityPage(1); }}
                onToChange={(v) => { setActivityTo(v); setActivityPage(1); }}
              />

              {isActivityLoading && <LoadingState />}

              {isActivityError && (
                <EmptyState
                  title="Unable to load activity logs"
                  description="Something went wrong while loading activity logs."
                  action={
                    <Button variant="secondary" onClick={() => refetchActivityLogs()}>
                      Try again
                    </Button>
                  }
                />
              )}

              {!isActivityLoading && !isActivityError && activityLogs.length === 0 && (
                <EmptyState
                  title="No activity logs"
                  description="No requests match the current filters."
                />
              )}

              {!isActivityLoading && !isActivityError && activityLogs.length > 0 && (
                <>
                  <div className={isActivityFetching ? "opacity-60 transition-opacity" : ""}>
                    <ActivityLogTable logs={activityLogs} />
                  </div>
                  <Pagination
                    pagination={{
                      page: activityPageData?.page ?? 0,
                      size: activityPageData?.size ?? 20,
                      totalElements: activityPageData?.totalElements ?? 0,
                      totalPages: activityPageData?.totalPages ?? 1,
                      first: activityPageData?.first ?? true,
                      last: activityPageData?.last ?? true,
                      empty: activityLogs.length === 0,
                    }}
                    onPageChange={(nextPage) => setActivityPage(nextPage + 1)}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}