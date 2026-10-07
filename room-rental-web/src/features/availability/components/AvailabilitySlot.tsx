import type { TimeSlotResponse } from "../types/availability";

interface AvailabilitySlotProps {
  slot: TimeSlotResponse;

  operatingStart: number;
  operatingEnd: number;

  onDoubleClick: (slot: TimeSlotResponse) => void;
}

export function AvailabilitySlot({
  slot,
  operatingStart,
  operatingEnd,
  onDoubleClick,
}: AvailabilitySlotProps) {
  const start = Math.max(operatingStart, timeToMinutes(slot.start));

  const end = Math.min(operatingEnd, timeToMinutes(slot.end));

  const duration = end - start;

  if (duration <= 0) {
    return null;
  }

  const left =
    ((start - operatingStart) / (operatingEnd - operatingStart)) * 100;

  const width = (duration / (operatingEnd - operatingStart)) * 100;

  const clickable = slot.status === "AVAILABLE";

  return (
    <button
      type="button"
      disabled={!clickable}
      onDoubleClick={() => clickable && onDoubleClick(slot)}
      className={[
        "absolute top-1 bottom-1 rounded-md border px-2",
        "overflow-hidden text-left text-xs transition",

        slot.status === "AVAILABLE"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100"
          : "",

        slot.status === "RESERVED"
          ? "cursor-default border-red-200 bg-red-50 text-red-700"
          : "",

        slot.status === "BLOCKED"
          ? "cursor-default border-amber-200 bg-amber-50 text-amber-700"
          : "",
      ].join(" ")}
      style={{
        left: `${left}%`,
        width: `${width}%`,
      }}
    >
      <div className="truncate font-medium">
        {slot.start} – {slot.end}
      </div>

      {slot.referenceNo && (
        <div className="mt-0.5 truncate text-[11px] opacity-75">
          {slot.referenceNo}
        </div>
      )}

      {slot.reason && (
        <div className="mt-0.5 truncate text-[11px] opacity-75">
          {slot.reason}
        </div>
      )}
    </button>
  );
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);

  return hours * 60 + minutes;
}
