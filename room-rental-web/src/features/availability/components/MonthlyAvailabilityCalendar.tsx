import {
  ChevronLeft,
  ChevronRight,
} from "../../../components/ui/MaterialIcon.tsx";

import { DateTime } from "luxon";

import type {
  DailyAvailabilityStatus,
  MonthlyAvailabilityDay,
} from "../types/availability";

interface MonthlyAvailabilityCalendarProps {
  month: DateTime;
  days: MonthlyAvailabilityDay[];
  onDateDoubleClick: (date: string, day: MonthlyAvailabilityDay) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const statusStyles: Record<DailyAvailabilityStatus, string> = {
  AVAILABLE: "border-emerald-200 bg-emerald-50 text-emerald-700",

  PARTIALLY_RESERVED: "border-amber-200 bg-amber-50 text-amber-700",

  FULLY_RESERVED: "border-rose-200 bg-rose-50 text-rose-700",

  BLOCKED: "border-orange-200 bg-orange-50 text-orange-700",

  CLOSED: "border-slate-200 bg-slate-100 text-slate-500",
};

const statusLabel: Record<DailyAvailabilityStatus, string> = {
  AVAILABLE: "Available",

  PARTIALLY_RESERVED: "Partially reserved",

  FULLY_RESERVED: "Fully reserved",

  BLOCKED: "Blocked",

  CLOSED: "Closed",
};

export function MonthlyAvailabilityCalendar({
  month,
  days,
  onDateDoubleClick,
  onPreviousMonth,
  onNextMonth,
}: MonthlyAvailabilityCalendarProps) {
  const dayMap = new Map(days.map((day) => [day.date, day]));

  const firstDay = month.startOf("month");

  const leadingEmptyDays = firstDay.weekday - 1;

  const totalDays = month.daysInMonth ?? 0;

  const cells = Array.from(
    {
      length: leadingEmptyDays + totalDays,
    },
    (_, index) => {
      if (index < leadingEmptyDays) {
        return null;
      }

      const dayNumber = index - leadingEmptyDays + 1;

      const date = month
        .set({
          day: dayNumber,
        })
        .toISODate()!;

      return dayMap.get(date) ?? null;
    },
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPreviousMonth}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dadce0] bg-white transition hover:bg-slate-50"
        >
          <ChevronLeft size={17} />
        </button>

        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900">
            {month.toFormat("LLLL yyyy")}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Double-click an available date to create a reservation
          </p>
        </div>

        <button
          type="button"
          onClick={onNextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dadce0] bg-white transition hover:bg-slate-50"
        >
          <ChevronRight size={17} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-xs font-semibold text-slate-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="min-h-[110px]" />;
          }

          const date = DateTime.fromISO(day.date).toISODate()!;

          const dateNumber = DateTime.fromISO(day.date).day;
          const dayStart = DateTime.fromISO(day.date).startOf("day");
          const todayStart = DateTime.now().startOf("day");
          const isPast = dayStart < todayStart;

          const isDisabled =
            ["FULLY_RESERVED", "BLOCKED", "CLOSED"].includes(day.status) ||
            isPast;

          return (
            <button
              key={day.date}
              type="button"
              onDoubleClick={(event) => {
                event.preventDefault();
                if(isDisabled){
                  return;
                }
                onDateDoubleClick(date, day);
              }}
              aria-label={`${date}: ${statusLabel[day.status]}`}
              className={[
                "min-h-[110px]",
                "rounded-xl",
                "border",
                "p-3",
                "text-left",
                "transition",
                statusStyles[day.status],
                isDisabled ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:-translate-y-0.5",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold">{dateNumber}</span>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold">
                  {statusLabel[day.status]}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-3 border-t border-slate-100 pt-4">
        <Legend className="bg-emerald-500" label="Available" />

        <Legend className="bg-amber-500" label="Partially reserved" />

        <Legend className="bg-rose-500" label="Fully reserved" />

        <Legend className="bg-orange-500" label="Blocked" />

        <Legend className="bg-slate-400" label="Closed" />
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={["h-2.5 w-2.5 rounded-full", className].join(" ")} />

      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
