import type {
  RoomAvailabilityResponse,
  TimelineRange,
  TimeSlotResponse,
} from "../types/availability";
import { formatMinutes } from "../utils/time";
import AvailabilityGridRow from "./AvailabilityRow";

interface AvailabilityGridProps {
  rooms: RoomAvailabilityResponse[];

  timeline: TimelineRange;
  date: string;

  onSlotDoubleClick: (
    room: RoomAvailabilityResponse,
    slot: TimeSlotResponse,
  ) => void;
  hourlyPrices?: Record<number, { price: number; currencyCode: string }>;
}

export function AvailabilityGrid({
  rooms,
  timeline,
  date,
  onSlotDoubleClick,
  hourlyPrices = {},
}: AvailabilityGridProps) {
  const hours: number[] = [];

  for (
    let minute = Math.floor(timeline.start / 60) * 60;
    minute < timeline.end + 60;
    minute += 60
  ) {
    hours.push(minute);
  }
  const ROOM_COL_WIDTH = 240;
  const HOUR_COL_WIDTH = 80;
  const columnCount = hours.length - 1; // actual number of hour cells rendered
  const gridWidth = ROOM_COL_WIDTH + columnCount * HOUR_COL_WIDTH;

  return (
    <div className="relative overflow-x-auto rounded-lg border border-[#dadce0] bg-white scrollbar-none">
      <div style={{ minWidth: gridWidth }}>
        {/* Header */}

        <div className="grid grid-cols-[240px_minmax(800px,1fr)]">
          {/* Room label column — sticky so it stays visible while scrolling horizontally */}
          <div className="sticky left-0 z-20 border-r border-[#dadce0] bg-white px-4 py-3 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
            <p className="text-xs font-medium text-[#5f6368]">Room</p>
          </div>

          {/* Hour labels – locked to match body rows exactly */}
          <div className="relative flex bg-white">
            {hours.slice(0, -1).map((minute, index) => (
              <div
                key={minute}
                className="relative flex-1 shrink-0 min-w-20 px-2 py-3"
              >
                <span
                  className={[
                    "absolute text-xs font-medium text-[#5f6368] whitespace-nowrap",
                    index === 0 ? "left-0" : "left-0 -translate-x-1/2",
                  ].join(" ")}
                >
                  {formatMinutes(minute)}
                </span>
              </div>
            ))}

            {/* Final boundary label, pinned to the right edge of the last cell */}
            <span className="absolute right-0 top-3 text-xs font-medium text-[#5f6368] whitespace-nowrap">
              {formatMinutes(hours[hours.length - 1])}
            </span>
          </div>
        </div>

        {/* Rows */}

        {rooms.map((room) => (
          <AvailabilityGridRow
            key={room.roomId}
            date={date}
            room={room}
            timeline={timeline}
            onSlotDoubleClick={(slot) => onSlotDoubleClick(room, slot)}
            hourlyPrice={hourlyPrices[room.roomId]}
          />
        ))}
      </div>
    </div>
  );
}
