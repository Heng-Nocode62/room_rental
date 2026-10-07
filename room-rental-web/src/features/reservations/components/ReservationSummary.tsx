import { Calendar, Tag } from "../../../components/ui/MaterialIcon.tsx";
import { Card } from "../../../components/ui";
import { formatTime } from "../../availability/utils/time";

interface ReservationSummaryProps {
  roomNumber: string;
  roomName: string;

  startDate: string;
  startTime: string;

  endDate: string;
  endTime: string;

  timezone: string;

  pricingName?: string;
  pricingAmount?: number;
  currencyCode?: string;
}

export function ReservationSummary({
  roomNumber,
  roomName,
  startDate,
  startTime,
  endDate,
  endTime,
  timezone,
  pricingName,
  pricingAmount,
  currencyCode,
}: ReservationSummaryProps) {
  const hasStart = Boolean(startDate && startTime);
  const hasEnd = Boolean(endDate && endTime);

  return (
    <Card>
      <h2 className="text-base font-semibold text-gray-900">Summary</h2>

      <div className="mt-5 divide-y divide-gray-100">
        {/* Room */}
        <div className="flex items-start gap-3 pb-4">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
            <span className="text-xs font-semibold">
              {roomNumber.slice(0, 1)}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500">Room</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">
              {roomNumber} · {roomName}
            </p>
          </div>
        </div>

        {/* Date & time */}
        <div className="flex items-start gap-3 py-4">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
            <Calendar className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-2.5">
            <div>
              <p className="text-xs text-gray-500">From</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900">
                {hasStart ? `${startDate} · ${formatTime(startTime)}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">To</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900">
                {hasEnd ? `${endDate} · ${formatTime(endTime)}` : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        {pricingName && (
          <div className="flex items-start gap-3 pt-4">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pricing</p>
              <p className="mt-0.5 text-sm">
                <span className="font-semibold text-gray-900">
                  {pricingName}
                </span>
                {pricingAmount !== undefined && (
                  <span className="ml-1.5 font-medium text-gray-500">
                    {pricingAmount.toFixed(2)} {currencyCode}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}