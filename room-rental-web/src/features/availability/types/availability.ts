// src/features/availability/types/availability.ts

export type SlotStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "BLOCKED";

export interface TimeSlotResponse {
  start: string;
  end: string;

  status: SlotStatus;

  reservationId?: number;
  referenceNo?: string;
  reason?: string;
}

export interface DayAvailabilityResponse {
  roomId: number;
  roomNumber: string;
  roomName: string;

  date: string;
  timezone: string;

  slots: TimeSlotResponse[];
}


export interface RoomAvailabilityResponse {
  roomId: number;
  locationId: number;

  roomNumber: string;
  roomName: string;

  roomTypeId: number;
  roomTypeName: string;

  capacity: number;

  timezone: string;

  operatingStart: string | null;
  operatingEnd: string | null;

  slots: TimeSlotResponse[];
}

export interface DayAvailabilityOverviewResponse {
  date: string;

  rooms: RoomAvailabilityResponse[];
}


export interface TimelineRange {
  start: number;
  end: number;
}


export type DailyAvailabilityStatus =
  | "AVAILABLE"
  | "PARTIALLY_RESERVED"
  | "FULLY_RESERVED"
  | "BLOCKED"
  | "CLOSED";

export interface MonthlyAvailabilityDay {
  date: string;
  status: DailyAvailabilityStatus;
}

export interface MonthlyAvailabilityResponse {
  roomId: number;

  roomNumber: string;
  roomName: string;

  year: number;
  month: number;

  days: MonthlyAvailabilityDay[];
}
