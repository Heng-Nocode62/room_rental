import { useEffect, useRef } from "react";
import { DateTime } from "luxon";
import type {
  RoomAvailabilityResponse,
  TimeSlotResponse,
} from "../types/availability";
import { formatMinutes, timeToMinutes } from "../utils/time";
import RoomInfo from "./RoomInfo";

interface Props {
  rooms: RoomAvailabilityResponse[];
  date: string;
  onSelectSlot: (room: RoomAvailabilityResponse, slot: TimeSlotResponse) => void;
  hourlyPrices?: Record<number, { price: number; currencyCode: string }>;
}

/**
 * One horizontally scrolling row of slot chips per room.
 * On mount (and when the date changes) it scrolls to the first open slot,
 * so the useful part of the day is visible without swiping.
 */
function SlotRow({
  room,
  date,
  slots,
  isPassed,
  onSelectSlot,
}: {
  room: RoomAvailabilityResponse;
  date: string;
  slots: TimeSlotResponse[];
  isPassed: (slot: TimeSlotResponse) => boolean;
  onSelectSlot: Props["onSelectSlot"];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const firstOpenRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const target = firstOpenRef.current;
    if (!scroller) return;
    scroller.scrollTo({
      left: target ? Math.max(0, target.offsetLeft - 12) : 0,
    });
  }, [date, room.roomId]);

  const firstOpenIndex = slots.findIndex(
    (s) => s.status === "AVAILABLE" && !isPassed(s),
  );

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex snap-x gap-2 overflow-x-auto px-3 py-3 pr-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slots.map((slot, index) => {
          const passed = isPassed(slot);
          const available = slot.status === "AVAILABLE" && !passed;

          const tone = passed
            ? "bg-gray-100 text-gray-400"
            : slot.status === "AVAILABLE"
              ? "bg-emerald-100 text-[#1e8e3e] active:bg-[#ceead6]"
              : slot.status === "RESERVED"
                ? "bg-[#fce8e6] text-[#d93025]"
                : "bg-[#fef7e0] text-[#ea8600]";

          const label = passed
            ? "Passed"
            : slot.status === "AVAILABLE"
              ? "Open"
              : slot.status === "RESERVED"
                ? "Reserved"
                : slot.status === "BLOCKED"
                  ? "Blocked"
                  : "Closed";

          const start = formatMinutes(timeToMinutes(slot.start));
          const end = formatMinutes(timeToMinutes(slot.end));

          return (
            <button
              key={`${slot.start}-${slot.end}`}
              ref={index === firstOpenIndex ? firstOpenRef : undefined}
              type="button"
              disabled={!available}
              onClick={() => onSelectSlot(room, slot)}
              aria-label={`${start} to ${end}, ${label}`}
              className={[
                "flex min-h-16 w-[84px] shrink-0 snap-start flex-col items-center justify-center rounded-lg px-1 py-2 text-center transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e8e3e]",
                tone,
                available ? "cursor-pointer" : "cursor-default",
              ].join(" ")}
            >
              <span className="text-sm font-semibold tabular-nums">{start}</span>
              <span className="text-[11px] leading-4 opacity-70">to {end}</span>
              <span className="text-[11px] font-medium leading-4">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Right-edge fade hints that the row scrolls */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}

export function AvailabilityMobileList({
  rooms,
  date,
  onSelectSlot,
  hourlyPrices = {},
}: Props) {
  const now = DateTime.now();

  return (
    <ul className="space-y-3">
      {rooms.map((room) => {
        const closed = room.operatingStart === null || room.operatingEnd === null;

        const slots = closed
          ? []
          : [...room.slots].sort(
              (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
            );

        const isPassed = (slot: TimeSlotResponse) =>
          DateTime.fromISO(`${date}T${slot.start}`) <= now;

        const openCount = slots.filter(
          (s) => s.status === "AVAILABLE" && !isPassed(s),
        ).length;

        return (
          <li
            key={room.roomId}
            className="overflow-hidden rounded-xl border border-[#dadce0] bg-white"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#dadce0] bg-[#f8f9fa]">
              <div className="min-w-0 flex-1">
                <RoomInfo room={room} hourlyPrice={hourlyPrices[room.roomId]} />
              </div>

              <span
                className={[
                  "mr-3 mt-3 shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                  closed
                    ? "bg-gray-200 text-[#5f6368]"
                    : openCount > 0
                      ? "bg-emerald-100 text-[#1e8e3e]"
                      : "bg-[#fce8e6] text-[#d93025]",
                ].join(" ")}
              >
                {closed
                  ? "Closed"
                  : openCount > 0
                    ? `${openCount} open`
                    : "Full"}
              </span>
            </div>

            {closed ? (
              <p className="px-4 py-4 text-sm text-[#80868b]">
                Closed on this date.
              </p>
            ) : slots.length === 0 ? (
              <p className="px-4 py-4 text-sm text-[#80868b]">
                No time slots for this date.
              </p>
            ) : (
              <SlotRow
                room={room}
                date={date}
                slots={slots}
                isPassed={isPassed}
                onSelectSlot={onSelectSlot}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}













// import { DateTime } from "luxon";
// import type {
//   RoomAvailabilityResponse,
//   TimeSlotResponse,
// } from "../types/availability";
// import { formatMinutes, timeToMinutes } from "../utils/time";
// import RoomInfo from "./RoomInfo";

// interface Props {
//   rooms: RoomAvailabilityResponse[];
//   date: string;
//   onSelectSlot: (room: RoomAvailabilityResponse, slot: TimeSlotResponse) => void;
//   hourlyPrices?: Record<number, { price: number; currencyCode: string }>;
// }

// export function AvailabilityMobileList({
//   rooms,
//   date,
//   onSelectSlot,
//   hourlyPrices = {},
// }: Props) {
//   const now = DateTime.now();

//   return (
//     <ul className="space-y-3">
//       {rooms.map((room) => {
//         const closed = room.operatingStart === null || room.operatingEnd === null;

//         const slots = closed
//           ? []
//           : [...room.slots].sort(
//               (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
//             );

//         const isPassed = (slot: TimeSlotResponse) =>
//           DateTime.fromISO(`${date}T${slot.start}`) <= now;

//         const openCount = slots.filter(
//           (s) => s.status === "AVAILABLE" && !isPassed(s),
//         ).length;

//         return (
//           <li
//             key={room.roomId}
//             className="overflow-hidden rounded-xl border border-[#dadce0] bg-white"
//           >
//             <div className="flex items-start justify-between gap-3 border-b border-[#dadce0] bg-[#f8f9fa]">
//               <div className="min-w-0 flex-1">
//                 <RoomInfo room={room} hourlyPrice={hourlyPrices[room.roomId]} />
//               </div>

//               <span
//                 className={[
//                   "mr-3 mt-3 shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
//                   closed
//                     ? "bg-gray-200 text-[#5f6368]"
//                     : openCount > 0
//                       ? "bg-emerald-100 text-[#1e8e3e]"
//                       : "bg-[#fce8e6] text-[#d93025]",
//                 ].join(" ")}
//               >
//                 {closed
//                   ? "Closed"
//                   : openCount > 0
//                     ? `${openCount} open`
//                     : "Full"}
//               </span>
//             </div>

//             {closed ? (
//               <p className="px-4 py-4 text-sm text-[#80868b]">
//                 Closed on this date.
//               </p>
//             ) : slots.length === 0 ? (
//               <p className="px-4 py-4 text-sm text-[#80868b]">
//                 No time slots for this date.
//               </p>
//             ) : (
//               <div className="grid grid-cols-3 gap-2 p-3 min-[420px]:grid-cols-4">
//                 {slots.map((slot) => {
//                   const passed = isPassed(slot);
//                   const available = slot.status === "AVAILABLE" && !passed;

//                   const tone = passed
//                     ? "bg-gray-100 text-gray-400"
//                     : slot.status === "AVAILABLE"
//                       ? "bg-emerald-100 text-[#1e8e3e] active:bg-[#ceead6]"
//                       : slot.status === "RESERVED"
//                         ? "bg-[#fce8e6] text-[#d93025]"
//                         : "bg-[#fef7e0] text-[#ea8600]";

//                   const label =
//                     passed
//                       ? "Passed"
//                       : slot.status === "AVAILABLE"
//                         ? "Open"
//                         : slot.status === "RESERVED"
//                           ? "Reserved"
//                           : slot.status === "BLOCKED"
//                             ? "Blocked"
//                             : "Closed";

//                   return (
//                     <button
//                       key={`${slot.start}-${slot.end}`}
//                       type="button"
//                       disabled={!available}
//                       onClick={() => onSelectSlot(room, slot)}
//                       aria-label={`${formatMinutes(timeToMinutes(slot.start))} to ${formatMinutes(timeToMinutes(slot.end))}, ${label}`}
//                       className={[
//                         "flex min-h-14 flex-col items-center justify-center rounded-lg px-1 py-1.5 text-center transition-colors",
//                         "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e8e3e]",
//                         tone,
//                         available ? "cursor-pointer" : "cursor-default",
//                       ].join(" ")}
//                     >
//                       <span className="text-sm font-semibold tabular-nums">
//                         {formatMinutes(timeToMinutes(slot.start))}
//                       </span>
//                       <span className="text-[11px] leading-4 opacity-80">
//                         {label}
//                       </span>
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </li>
//         );
//       })}
//     </ul>
//   );
// }