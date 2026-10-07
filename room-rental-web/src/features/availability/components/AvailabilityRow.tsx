import type { RoomAvailabilityResponse, TimelineRange, TimeSlotResponse } from "../types/availability";
import { timeToMinutes } from "../utils/time";
import AvailabilityCell from "./AvailabilityCell";
import RoomInfo from "./RoomInfo";


interface AvailabilityGridRowProps {
  room: RoomAvailabilityResponse;

  timeline: TimelineRange;
  date: string;

  onSlotDoubleClick: (slot: TimeSlotResponse) => void;
  hourlyPrice?: {price:number; currencyCode:string};
}

export default function AvailabilityGridRow({
  room,
  timeline,
  date,
  onSlotDoubleClick,
  hourlyPrice,
}: AvailabilityGridRowProps) {
  if (room.operatingStart === null || room.operatingEnd === null) {
    return (
      <div className="grid grid-cols-[240px_minmax(800px,1fr)] border-b border-[#dadce0] last:border-b-0">
        <div className="sticky left-0 z-10 border-r border-[#dadce0] bg-white shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
          <RoomInfo room={room} hourlyPrice={hourlyPrice} />
        </div>

        <div className="flex min-h-20 items-center bg-[#f8f9fa] px-6">
          <span className="text-sm font-medium text-[#80868b]">Closed</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[240px_minmax(800px,1fr)] border-b border-[#dadce0] last:border-b-0">
      <div className="sticky left-0 z-10 border-r border-[#dadce0] bg-white shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
        <RoomInfo room={room} hourlyPrice={hourlyPrice} />
      </div>

      <div className="flex min-h-20">
        {Array.from({
          length: Math.ceil((timeline.end - timeline.start) / 60),
        }).map((_, index) => {
          const hourStart = timeline.start + index * 60;

          const hourEnd = hourStart + 60;

          const slot = room.slots.find((candidate) => {
            const candidateStart = timeToMinutes(candidate.start);
            const candidateEnd = timeToMinutes(candidate.end);
            return candidateStart < hourEnd && candidateEnd > hourStart;
          });
          if (!slot) {
            return (
              <div
                key={hourStart}
                className="min-w-[80px] flex-1 border-r border-[#dadce0] bg-[#f8f9fa] last:border-r-0"
              />
            );
          }

          return (
            <AvailabilityCell
              key={hourStart}
              slot={slot}
              date={date}
              onDoubleClick={() => onSlotDoubleClick(slot)}
            />
          );
        })}
      </div>
    </div>
  );
}