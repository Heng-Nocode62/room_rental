import { useEffect, useState, type ReactNode } from "react";

import {
  Ban,
  CheckCircle2,
  Plus,
  XCircle,
} from "../../../components/ui/MaterialIcon.tsx";

import {
  Button,
  Card,
  EmptyState,
  LoadingState,
  Modal,
  PageHeader,
  Pagination,
} from "../../../components/ui/index.ts";

import { useTranslation } from "react-i18next";

import { useDebouncedValue } from "../../rooms/hooks/useDebouncedValue";
import { getErrorMessage } from "../../rooms/utils/roomUtils";

import { useRoomBlocks } from "../hooks/useRoomBlocks";
import { useRoomBlockAction } from "../hooks/useRoomBlockAction";

import type {
  RoomBlockResponse,
  RoomBlockStatus,
  RoomBlockType,
} from "../types/roomBlock";

import { formatBlockDateTime, todayString } from "../utils/roomBlockUtils";

import { RoomBlockFilters } from "./RoomBlockFilters";
import { RoomBlockTable } from "./RoomBlockTable";
import { RoomBlockDetailDialog } from "./RoomBlockDetailDialog";

interface Props {
  /** Restricts the list to one location (owner). Leave empty for all (admin). */
  locationId?: number;

  /** Renders the page specific "create" dialog (admin / owner variants). */
  renderCreateDialog: (props: {
    open: boolean;
    onClose: () => void;
  }) => ReactNode;
}

type Notice = { type: "success" | "error"; message: string } | null;

type Pending = { type: "complete" | "cancel"; block: RoomBlockResponse } | null;

export function RoomBlocksPageView({ locationId, renderCreateDialog }: Props) {
  const { t } = useTranslation();

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<RoomBlockStatus | "">("");
  const [blockType, setBlockType] = useState<RoomBlockType | "">("");
  const [date, setDate] = useState(todayString);
  const [page, setPage] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [view, setView] = useState<RoomBlockResponse | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const debouncedKeyword = useDebouncedValue(keyword, 350);

  const { data, isLoading, isFetching, isError, refetch } = useRoomBlocks({
    locationId,
    keyword: debouncedKeyword.trim() || undefined,
    status: status || undefined,
    blockType: blockType || undefined,
    date: date || undefined,
    page,
    size: 20,
    sort: "startAt,desc",
  });

  const complete = useRoomBlockAction("complete");
  const cancel = useRoomBlockAction("cancel");

  const loadingAction = complete.isPending
    ? "complete"
    : cancel.isPending
      ? "cancel"
      : null;

  // Start from page 1 when the active location changes.
  useEffect(() => {
    setPage(0);
  }, [locationId]);

  useEffect(() => {
    if (!notice || notice.type !== "success") return;

    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const clear = () => {
    setKeyword("");
    setStatus("");
    setBlockType("");
    // setDate(todayString());
    setDate('');
    setPage(0);
  };

  const askConfirm = (type: "complete" | "cancel", block: RoomBlockResponse) => {
    setView(null);
    setPending({ type, block });
  };

  const confirm = async () => {
    if (!pending) return;

    const { type, block } = pending;

    try {
      if (type === "complete") {
        await complete.mutateAsync(block.id);
      } else {
        await cancel.mutateAsync(block.id);
      }

      setNotice({
        type: "success",
        message: `Block on room ${block.roomNumber} ${
          type === "complete" ? "marked as complete" : "cancelled"
        }.`,
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error, "Unable to update the room block."),
      });
    } finally {
      setPending(null);
    }
  };

  const totalElements = data
    ? (data as { totalElements?: number }).totalElements
    : undefined;

  const hasFilters = Boolean(
    keyword.trim() || status || blockType || date !== todayString(),
  );

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <PageHeader
        icon={<Ban size={19} />}
        title={t("roomBlocks")}
        description="Rooms that are temporarily unavailable for booking."
        actions={
          <Button
            leftIcon={<Plus size={17} />}
            onClick={() => setCreateOpen(true)}
          >
            Block a room
          </Button>
        }
      />

      {notice && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={[
            "flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm",
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800",
          ].join(" ")}
        >
          <p>{notice.message}</p>

          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setNotice(null)}
            className="text-lg leading-none opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      <Card>
        <RoomBlockFilters
          keyword={keyword}
          status={status}
          blockType={blockType}
          date={date}
          defaultDate={todayString()}
          resultLabel={
            totalElements !== undefined
              ? `${totalElements} ${totalElements === 1 ? "block" : "blocks"}`
              : undefined
          }
          onClear={clear}
          onKeywordChange={(v) => {
            setKeyword(v);
            setPage(0);
          }}
          onStatusChange={(v) => {
            setStatus(v as RoomBlockStatus | "");
            setPage(0);
          }}
          onBlockTypeChange={(v) => {
            setBlockType(v as RoomBlockType | "");
            setPage(0);
          }}
          onDateChange={(v) => {
            setDate(v);
            setPage(0);
          }}
        />
      </Card>

      {isLoading && <LoadingState />}

      {isError && (
        <EmptyState
          title="Unable to load room blocks"
          description="Something went wrong while loading room blocks."
          action={
            <Button variant="secondary" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      )}

      {!isLoading && !isError && data?.empty && (
        <EmptyState
          title="No room blocks found"
          description={
            hasFilters
              ? "There are no room blocks matching your filters."
              : "No rooms are blocked right now."
          }
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clear}>
                Clear filters
              </Button>
            ) : (
              <Button
                leftIcon={<Plus size={16} />}
                onClick={() => setCreateOpen(true)}
              >
                Block a room
              </Button>
            )
          }
        />
      )}

      {!isLoading && !isError && data && !data.empty && (
        <div
          className={[
            "space-y-4 transition-opacity",
            isFetching ? "opacity-60" : "opacity-100",
          ].join(" ")}
          aria-busy={isFetching}
        >
          <Card className="overflow-hidden p-0">
            <RoomBlockTable
              blocks={data.content}
              onView={setView}
              onComplete={(item) => askConfirm("complete", item)}
              onCancel={(item) => askConfirm("cancel", item)}
            />
          </Card>

          <Pagination pagination={data} onPageChange={setPage} />
        </div>
      )}

      <RoomBlockDetailDialog
        block={view}
        onClose={() => setView(null)}
        loadingAction={loadingAction}
        onComplete={(block) => askConfirm("complete", block)}
        onCancel={(block) => askConfirm("cancel", block)}
      />

      {renderCreateDialog({
        open: createOpen,
        onClose: () => setCreateOpen(false),
      })}

      {/* Confirmation */}
      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title={
          pending?.type === "complete" ? "Mark block as complete" : "Cancel room block"
        }
      >
        {pending && (
          <div className="space-y-5">
            <div className="flex gap-4">
              <div
                className={[
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  pending.type === "complete"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600",
                ].join(" ")}
              >
                {pending.type === "complete" ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <XCircle size={20} />
                )}
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  {pending.type === "complete"
                    ? `Complete the block on ${pending.block.roomNumber}?`
                    : `Cancel the block on ${pending.block.roomNumber}?`}
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {formatBlockDateTime(pending.block.startAt)} →{" "}
                  {formatBlockDateTime(pending.block.endAt)}.{" "}
                  {pending.type === "complete"
                    ? "The room will be available for booking again."
                    : "The room will be released and available for booking again."}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button
                variant="secondary"
                onClick={() => setPending(null)}
                disabled={loadingAction !== null}
              >
                Keep block
              </Button>

              <Button
                onClick={() => void confirm()}
                loading={loadingAction !== null}
                className={
                  pending.type === "cancel"
                    ? "bg-red-600 hover:bg-red-700"
                    : undefined
                }
              >
                {pending.type === "complete" ? "Mark complete" : "Cancel block"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}