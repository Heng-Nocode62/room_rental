import { CalendarDays, Edit3, Eye, Power } from "../../../components/ui/MaterialIcon.tsx";
import { ActionMenu, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../../../components/ui";
import type { RoomPriceResponse } from "../types/roomPrice";
import { RoomPriceStatusBadge } from "./RoomPriceStatusBadge";

interface Props {
  prices: RoomPriceResponse[];
  onView: (price: RoomPriceResponse) => void;
  onEdit: (price: RoomPriceResponse) => void;
  onDeactivate: (price: RoomPriceResponse) => void;
}

export function RoomPriceTable({ prices, onView, onEdit, onDeactivate }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow className="bg-slate-50/80">
              <TableHeaderCell>Room</TableHeaderCell>
              <TableHeaderCell>Pricing unit</TableHeaderCell>
              <TableHeaderCell>Price</TableHeaderCell>
              <TableHeaderCell>Effective period</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="w-20 text-right">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prices.map((price) => (
              <TableRow key={price.id} className="group transition-colors hover:bg-indigo-50/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <CalendarDays size={17} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{price.roomNumber}</p>
                      <p className="text-xs text-slate-500">Room ID: {price.roomId}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-slate-800">{price.pricingUnitName}</p>
                  <span className="mt-1 inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{price.pricingUnitCode}</span>
                </TableCell>
                <TableCell>
                  <span className="text-base font-semibold tabular-nums text-slate-900">{price.price.toFixed(2)}</span>
                  <span className="ml-1.5 text-xs font-medium text-slate-500">{price.currencyCode}</span>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-slate-700">{price.effectiveFrom}</p>
                  <p className="mt-0.5 text-xs text-slate-400">to {price.effectiveTo || "No end date"}</p>
                </TableCell>
                <TableCell><RoomPriceStatusBadge status={price.status} /></TableCell>
                <TableCell className="text-right">
                  <ActionMenu items={[
                    { label: "View details", icon: <Eye size={15} />, onClick: () => onView(price) },
                    { label: "Edit price", icon: <Edit3 size={15} />, onClick: () => onEdit(price) },
                    ...(price.status === "ACTIVE" ? [{ label: "Deactivate", icon: <Power size={15} />, tone: "danger" as const, dividerBefore: true, onClick: () => onDeactivate(price) }] : []),
                  ]} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
