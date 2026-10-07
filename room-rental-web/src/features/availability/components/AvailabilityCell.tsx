import { DateTime } from "luxon";
import type { TimeSlotResponse } from "../types/availability";

interface AvailabilityCellProps {
  slot: TimeSlotResponse;
  date: string;
  onDoubleClick: () => void;
}

export default function AvailabilityCell({
  slot,
  date,
  onDoubleClick,
}: AvailabilityCellProps) {
  const available = slot.status === "AVAILABLE";
  const reserved = slot.status === "RESERVED";
  const blocked = slot.status === "BLOCKED";

  const now = DateTime.now();
  const slotStart = DateTime.fromISO(`${date}T${slot.start}`);
  const passed = slotStart <= now;

  return (
    <button
      type="button"
      disabled={!available || passed}
      title={slot.referenceNo ?? slot.reason ?? `${slot.start} – ${slot.end}`}
      onDoubleClick={onDoubleClick}
      className={[
        "min-w-[80px] flex-1 border-r border-[#dadce0] p-1 transition-colors last:border-r-0",

        available
          ? "cursor-pointer bg-emerald-100 hover:bg-[#ceead6]"
          : "",

        reserved ? "cursor-default bg-[#fce8e6]" : "",

        blocked ? "cursor-default bg-[#fef7e0]" : "",

        passed ? "cursor-default bg-gray-100" : "",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-full min-h-16 flex-col items-center justify-center rounded-md",

          available && !passed ? "text-[#1e8e3e]" : "",

          reserved ? "text-[#d93025]" : "",

          blocked ? "text-[#ea8600]" : "",

          passed ? "text-gray-400" : "",
        ].join(" ")}
      >
        {passed && <span className="text-sm text-red-700/90">passed</span>}
      </div>
    </button>
  );
}
