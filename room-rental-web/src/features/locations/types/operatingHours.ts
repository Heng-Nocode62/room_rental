export interface OperatingHoursResponse {
  id: number;
  locationId: number;
  dayOfWeek: number; // ISO: 1 = Monday ... 7 = Sunday
  openTime?: string | null;
  closeTime?: string | null;
  closed: boolean;
}

export interface OperatingHoursRequest {
  dayOfWeek: number;
  openTime?: string | null;
  closeTime?: string | null;
  closed: boolean;
}

export const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
] as const;
