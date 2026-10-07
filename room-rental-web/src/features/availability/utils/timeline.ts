import type { RoomAvailabilityResponse } from "../types/availability";

import { timeToMinutes } from "./time";

export interface TimelineRange {
  start: number;
  end: number;
}

export function getTimelineRange(
  rooms: RoomAvailabilityResponse[],
): TimelineRange | null {
  const operatingRooms = rooms.filter(
    (room) => room.operatingStart !== null && room.operatingEnd !== null,
  );

  if (operatingRooms.length === 0) {
    return null;
  }

  const start = Math.min(
    ...operatingRooms.map((room) => timeToMinutes(room.operatingStart!)),
  );

  const end = Math.max(
    ...operatingRooms.map((room) => timeToMinutes(room.operatingEnd!)),
  );

  return {
    start,
    end,
  };
}
