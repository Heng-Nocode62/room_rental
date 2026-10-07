import { useState } from "react";
import { Ban, Plus } from "../../../components/ui/MaterialIcon.tsx";
import {
  Button,
  EmptyState,
  LoadingState,
  PageHeader,
  Pagination,
  QuickViewDialog,
} from "../../../components/ui/index.ts";
import { RoomBlockFilters } from "../../room-blocks/components/RoomBlockFilters";
import { RoomBlockTable } from "../../room-blocks/components/RoomBlockTable";
import { OwnerRoomBlockCreateDialog } from "../components/room-blocks/OwnerRoomBlockCreateDialog.tsx";
import { useRoomBlocks } from "../../room-blocks/hooks/useRoomBlocks.ts";
import { useRoomBlockAction } from "../../room-blocks/hooks/useRoomBlockAction.ts";
import type {
  RoomBlockResponse,
  RoomBlockStatus,
  RoomBlockType,
} from "../../room-blocks/types/roomBlock.ts";
import { useTranslation } from "react-i18next";
import { useLocationScope } from "../../location-scope/LocationScopeProvider";
export default function RoomBlocksPage() {
  const scope = useLocationScope();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<RoomBlockStatus | "">("");
  const [blockType, setBlockType] = useState<RoomBlockType | "">("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [view, setView] = useState<RoomBlockResponse | null>(null);
  const { data, isLoading, isError, refetch } = useRoomBlocks({
    locationId: scope.currentLocationId ?? undefined,
    keyword: keyword.trim() || undefined,
    status: status || undefined,
    blockType: blockType || undefined,
    date: date || undefined,
    page,
    size: 20,
    sort: "startAt,desc",
  });
  const complete = useRoomBlockAction("complete");
  const cancel = useRoomBlockAction("cancel");
  const clear = () => {
    setKeyword("");
    setStatus("");
    setBlockType("");
    setDate(new Date().toISOString().slice(0, 10));
    setPage(0);
  };
   const {t} = useTranslation();
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <PageHeader
        icon={<Ban size={19} />}
        title={t("roomBlocks")}
        actions={
          <Button
            leftIcon={<Plus size={17} />}
            onClick={() => setCreateOpen(true)}
          >
            Block a room
          </Button>
        }
      />
      <RoomBlockFilters
        keyword={keyword}
        status={status}
        blockType={blockType}
        date={date}
        onKeywordChange={(v) => {
          setKeyword(v);
          setPage(0);
        }}
        onStatusChange={(v) => {
          setStatus(v as any);
          setPage(0);
        }}
        onBlockTypeChange={(v) => {
          setBlockType(v as any);
          setPage(0);
        }}
        onDateChange={(v) => {
          setDate(v);
          setPage(0);
        }}
      />
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
      )}{" "}
      {!isLoading && !isError && data?.empty && (
        <EmptyState
          title="No room blocks found"
          description="There are no room blocks matching your filters."
          action={
            <Button variant="secondary" onClick={clear}>
              Clear filters
            </Button>
          }
        />
      )}{" "}
      {!isLoading && !isError && data && !data.empty && (
        <>
          <RoomBlockTable
            blocks={data.content}
            onView={setView}
            onComplete={(item) => void complete.mutateAsync(item.id)}
            onCancel={(item) => void cancel.mutateAsync(item.id)}
          />
          <Pagination pagination={data} onPageChange={setPage} />
        </>
      )}{" "}
      {view && (
        <QuickViewDialog
          open={!!view}
          onClose={() => setView(null)}
          title={`${view.roomNumber} · ${view.blockType}`}
          eyebrow={view.status}
          fields={[
            {
              label: "Schedule",
              value: `${view.startAt} → ${view.endAt}`,
              wide: true,
            },
            { label: "Reason", value: view.reason || "—" },
            { label: "Created by", value: view.createdByName },
            { label: "Notes", value: view.notes || "—", wide: true },
          ]}
        />
      )}
      <OwnerRoomBlockCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        locationId={scope.currentLocationId ?? undefined}
      />
    </div>
  );
}
