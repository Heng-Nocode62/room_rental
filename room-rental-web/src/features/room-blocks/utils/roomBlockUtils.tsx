const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const BLOCK_TYPE_OPTIONS = [
  { value: "MAINTENANCE", label: "Maintenance", description: "Repairs and inspections" },
  { value: "CLEANING", label: "Cleaning", description: "Deep or scheduled cleaning" },
  { value: "PRIVATE_EVENT", label: "Private event", description: "Reserved for an event" },
  { value: "RENOVATION", label: "Renovation", description: "Planned works" },
  { value: "OTHER", label: "Other", description: "Anything else" },
] as const;

export const BLOCK_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  BLOCK_TYPE_OPTIONS.map((option) => [option.value, option.label]),
);

export const BLOCK_TYPE_STYLES: Record<string, string> = {
  MAINTENANCE: "bg-amber-50 text-amber-700 ring-amber-200",
  CLEANING: "bg-sky-50 text-sky-700 ring-sky-200",
  PRIVATE_EVENT: "bg-violet-50 text-violet-700 ring-violet-200",
  RENOVATION: "bg-orange-50 text-orange-700 ring-orange-200",
  OTHER: "bg-slate-100 text-slate-600 ring-slate-200",
};

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Formats "2026-10-11T09:30:00+07:00" as "11 Oct 2026, 09:30" by reading the
 * characters of the string itself. It never converts to the browser timezone,
 * so the wall-clock time is shown exactly as the API sent it.
 */
export function formatBlockDateTime(value?: string | null) {
  if (!value) return "—";

  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(value);

  if (!match) return value;

  const [, year, month, day, hour, minute] = match;

  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}, ${hour}:${minute}`;
}

export function formatDuration(start?: string | null, end?: string | null) {
  if (!start || !end) return null;

  const diff = Date.parse(end) - Date.parse(start);

  if (!Number.isFinite(diff) || diff <= 0) return null;

  const totalMinutes = Math.round(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return (
    [
      days ? `${days}d` : "",
      hours ? `${hours}h` : "",
      minutes ? `${minutes}m` : "",
    ]
      .filter(Boolean)
      .join(" ") || null
  );
}

/** Wall-clock arithmetic on a "YYYY-MM-DD" + "HH:mm" pair (no timezone involved). */
export function addMinutes(date: string, time: string, minutes: number) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);

  if ([y, m, d, hh, mm].some((part) => Number.isNaN(part))) return null;

  const result = new Date(Date.UTC(y, m - 1, d, hh, mm) + minutes * 60000);

  return {
    date: `${result.getUTCFullYear()}-${pad(result.getUTCMonth() + 1)}-${pad(result.getUTCDate())}`,
    time: `${pad(result.getUTCHours())}:${pad(result.getUTCMinutes())}`,
  };
}

export function todayString() {
  return new Date().toISOString().slice(0, 10);
}