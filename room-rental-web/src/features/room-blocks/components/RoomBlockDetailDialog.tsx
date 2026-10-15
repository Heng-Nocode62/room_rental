import { Button, Modal } from "../../../components/ui";

import type { RoomBlockResponse } from "../types/roomBlock";

import { formatBlockDateTime, formatDuration } from "../utils/roomBlockUtils";
import { RoomBlockActions } from "./RoomBlockActions";
import { RoomBlockStatusBadge } from "./RoomBlockStatusBadge";
import { RoomBlockTypeBadge } from "./RoomBlockTypeBadge";

interface Props {
  block: RoomBlockResponse | null;
  onClose: () => void;
  onComplete: (block: RoomBlockResponse) => void;
  onCancel: (block: RoomBlockResponse) => void;
  loadingAction?: "complete" | "cancel" | null;
}

export function RoomBlockDetailDialog({
  block,
  onClose,
  onComplete,
  onCancel,
  loadingAction = null,
}: Props) {
  if (!block) return null;

  const duration = formatDuration(block.startAt, block.endAt);

  return (
    <Modal
      open={!!block}
      onClose={onClose}
      title={`${block.roomNumber} · ${block.roomName}`}
      description="Room block details"
      size="lg"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <RoomBlockTypeBadge type={block.blockType} />
          <RoomBlockStatusBadge status={block.status} />
        </div>

        {/* Schedule */}
        <div>
          <SectionTitle>Schedule</SectionTitle>

          <div className="grid gap-3 sm:grid-cols-3">
            <Tile label="Starts" value={formatBlockDateTime(block.startAt)} />
            <Tile label="Ends" value={formatBlockDateTime(block.endAt)} />
            <Tile label="Duration" value={duration ?? "—"} />
          </div>
        </div>

        {/* Info */}
        <div>
          <SectionTitle>Details</SectionTitle>

          <div className="grid gap-3 sm:grid-cols-2">
            <Tile label="Reason" value={block.reason || "—"} />
            <Tile label="Created by" value={block.createdByName || "—"} />
          </div>
        </div>

        <div>
          <SectionTitle>Notes</SectionTitle>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
              {block.notes || "No notes."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <RoomBlockActions
            roomBlock={block}
            loadingAction={loadingAction}
            onComplete={() => onComplete(block)}
            onCancel={() => onCancel(block)}
          />

          <Button variant="secondary" onClick={onClose} className="ml-auto">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </h3>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}