import { CheckCircle2, Eye, XCircle } from "../../../components/ui/MaterialIcon.tsx";
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
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Room</TableHeaderCell>
          <TableHeaderCell>Type</TableHeaderCell>
          <TableHeaderCell>Schedule</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Created by</TableHeaderCell>
          <TableHeaderCell className="w-20 text-right">Actions</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {blocks.map((b) => (
          <TableRow key={b.id} className="hover:bg-slate-50/80">
            <TableCell>
              <p className="font-semibold text-slate-900">{b.roomNumber}</p>
              <p className="text-xs text-slate-500">{b.roomName}</p>
            </TableCell>
            <TableCell>
              <RoomBlockTypeBadge type={b.blockType} />
            </TableCell>
            <TableCell>
              <p className="text-sm text-slate-700">{b.startAt}</p>
              <p className="text-xs text-slate-400">to {b.endAt}</p>
            </TableCell>
            <TableCell>
              <RoomBlockStatusBadge status={b.status} />
            </TableCell>
            <TableCell>{b.createdByName}</TableCell>
            <TableCell className="text-right">
              <ActionMenu
                items={[
                  {
                    label: "View",
                    icon: <Eye size={15} />,
                    onClick: () => onView(b),
                  },
                  ...(b.status === "ACTIVE"
                    ? ([
                        {
                          label: "Complete",
                          icon: <CheckCircle2 size={15} />,
                          tone: "success",
                          onClick: () => onComplete(b) as any,
                        },
                        {
                          label: "Cancel",
                          icon: <XCircle size={15} />,
                          tone: "danger",
                          onClick: () => onCancel(b),
                          dividerBefore: true,
                        },
                      ] as any)
                    : []),
                ]}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
