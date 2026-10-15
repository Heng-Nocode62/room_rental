import {
  CheckCircle2,
  Eye,
  XCircle,
} from "../../../components/ui/MaterialIcon.tsx";

import {
  ActionMenu,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "../../../components/ui";

import type { RoomBlockResponse } from "../types/roomBlock";

import { formatBlockDateTime, formatDuration } from "../utils/roomBlockUtils";
import { RoomBlockStatusBadge } from "./RoomBlockStatusBadge";
import { RoomBlockTypeBadge } from "./RoomBlockTypeBadge";

interface Props {
  blocks: RoomBlockResponse[];
  onView: (item: RoomBlockResponse) => void;
  onComplete: (item: RoomBlockResponse) => void;
  onCancel: (item: RoomBlockResponse) => void;
}

export function RoomBlockTable({
  blocks,
  onView,
  onComplete,
  onCancel,
}: Props) {
  const menuItems = (block: RoomBlockResponse) => [
    {
      label: "View details",
      icon: <Eye size={15} />,
      onClick: () => onView(block),
    },
    ...(block.status === "ACTIVE"
      ? [
          {
            label: "Mark complete",
            icon: <CheckCircle2 size={15} />,
            tone: "success" as const,
            onClick: () => onComplete(block),
          },
          {
            label: "Cancel block",
            icon: <XCircle size={15} />,
            tone: "danger" as const,
            dividerBefore: true,
            onClick: () => onCancel(block),
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden md:block">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Room</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Schedule</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Created by</TableHeaderCell>
              <TableHeaderCell className="w-20 text-right">
                Actions
              </TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {blocks.map((block) => {
              const duration = formatDuration(block.startAt, block.endAt);

              return (
                <TableRow key={block.id} className="hover:bg-slate-50/80">
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => onView(block)}
                      className="group flex items-center gap-3 text-left"
                    >
                      <span className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-slate-900 px-2 text-xs font-semibold text-white">
                        {block.roomNumber}
                      </span>

                      <span>
                        <span className="block font-semibold text-slate-900 group-hover:underline">
                          {block.roomName}
                        </span>
                        {block.reason && (
                          <span className="block max-w-56 truncate text-xs text-slate-500">
                            {block.reason}
                          </span>
                        )}
                      </span>
                    </button>
                  </TableCell>

                  <TableCell>
                    <RoomBlockTypeBadge type={block.blockType} />
                  </TableCell>

                  <TableCell>
                    <p className="text-sm text-slate-800">
                      {formatBlockDateTime(block.startAt)}
                    </p>
                    <p className="text-xs text-slate-500">
                      to {formatBlockDateTime(block.endAt)}
                      {duration && (
                        <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                          {duration}
                        </span>
                      )}
                    </p>
                  </TableCell>

                  <TableCell>
                    <RoomBlockStatusBadge status={block.status} />
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-slate-700">
                      {block.createdByName}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <ActionMenu items={menuItems(block)} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="space-y-3 p-3 md:hidden">
        {blocks.map((block) => {
          const duration = formatDuration(block.startAt, block.endAt);

          return (
            <div
              key={block.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onView(block)}
                  className="flex min-w-0 items-center gap-3 text-left"
                >
                  <span className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-slate-900 px-2 text-xs font-semibold text-white">
                    {block.roomNumber}
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-slate-900">
                      {block.roomName}
                    </span>
                    <span className="block text-xs text-slate-500">
                      by {block.createdByName}
                    </span>
                  </span>
                </button>

                <ActionMenu items={menuItems(block)} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <RoomBlockTypeBadge type={block.blockType} />
                <RoomBlockStatusBadge status={block.status} />
              </div>

              <div className="mt-3 text-sm text-slate-700">
                <p>{formatBlockDateTime(block.startAt)}</p>
                <p className="text-xs text-slate-500">
                  to {formatBlockDateTime(block.endAt)}
                  {duration ? ` · ${duration}` : ""}
                </p>
              </div>

              {block.reason && (
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                  {block.reason}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}