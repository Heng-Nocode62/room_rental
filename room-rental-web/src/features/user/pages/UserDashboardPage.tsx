import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DateTime } from "luxon";

import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useLocations } from "../../locations/hooks/useLocations";
import { useRoomTypes } from "../../room-types/hooks/useRoomTypes";
import { useRooms } from "../../rooms/hooks/useRooms";

import { Icon, StatusBadge, cn } from "../components/UserUI";

import { RoomCard } from "../components/RoomCard";
import { LocationCard } from "../components/LocationCard";
import { useMyReservations } from "../hooks/useMyReservation";

/* Keep these in sync with the Browse Rooms page (or move both to a shared file). */
const START_TIMES = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];
const DURATIONS = [1, 2, 3, 4, 5, 6, 8];

/* 44px tall controls = comfortable tap targets on touch screens. */
const fieldBase =
  "h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 outline-none transition " +
  "focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 " +
  "dark:border-slate-700 dark:bg-slate-800 dark:text-white";
const selectWithIcon = `${fieldBase} pl-9 pr-9`;
const selectPlain = `${fieldBase} pl-3 pr-9`;
const dateField = `${fieldBase} pl-9 pr-3 [color-scheme:light] dark:[color-scheme:dark]`;

const roomGridClass =
  "grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-4";

function getGreeting() {
  const hour = DateTime.now().hour;
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/* ─── Small building blocks ──────────────────────────────── */
function ChevronDown() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function Field({
  label,
  htmlFor,
  icon,
  chevron,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  icon?: ReactNode;
  chevron?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        {children}
        {chevron && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <ChevronDown />
          </span>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  description,
  actionLabel,
  actionTo,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionTo: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      <Link
        to={actionTo}
        className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {actionLabel}
        <Icon name="arrow-right" size={14} />
      </Link>
    </div>
  );
}

function StatItem({
  value,
  label,
  icon,
}: {
  value: number | string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-2.5 p-3.5 sm:flex-row sm:items-center sm:gap-3 sm:px-5 sm:py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 sm:h-10 sm:w-10">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-none tracking-tight text-slate-950 dark:text-white">
          {value}
        </p>
        <p className="mt-1 text-xs leading-tight text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}

function StateMessage({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
      <p>{children}</p>
      {action}
    </div>
  );
}

function relativeDayLabel(start: DateTime) {
  const today = DateTime.now().startOf("day");
  const diff = Math.round(start.startOf("day").diff(today, "days").days);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return start.toFormat("ccc, dd MMM");
}

function UpcomingBooking({
  reservation,
  moreCount,
}: {
  reservation: {
    roomName: string;
    referenceNumber?: string;
    startAt: string;
    endAt: string;
    status: string;
  };
  moreCount: number;
}) {
  const start = DateTime.fromISO(reservation.startAt);
  const end = DateTime.fromISO(reservation.endAt);

  return (
    <section
      aria-label="Your next booking"
      className="overflow-hidden rounded-2xl border border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10"
    >
      <div className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {/* Date tile */}
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <span className="text-[11px] font-medium uppercase leading-none opacity-80">
              {start.toFormat("MMM")}
            </span>
            <span className="mt-1 text-2xl font-bold leading-none">
              {start.toFormat("dd")}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                Your next booking · {relativeDayLabel(start)}
              </p>
              <StatusBadge status={reservation.status} />
            </div>
            <h2 className="mt-1 truncate text-lg font-bold tracking-tight text-slate-950 dark:text-white">
              {reservation.roomName}
            </h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="clock" size={14} />
                {start.toFormat("hh:mm a")} – {end.toFormat("hh:mm a")}
              </span>
              {reservation.referenceNumber && (
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  Ref {reservation.referenceNumber}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
          {moreCount > 0 && (
            <span className="text-center text-xs text-slate-500 dark:text-slate-400">
              +{moreCount} more upcoming
            </span>
          )}
          <Link
            to="/user/reservations"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-blue-200 transition hover:bg-blue-100 dark:bg-slate-900 dark:text-blue-300 dark:ring-blue-500/30 dark:hover:bg-slate-800"
          >
            View bookings
            <Icon name="arrow-right" size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function RoomSkeletons({ count }: { count: number }) {
  return (
    <div className={roomGridClass} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          // Fewer placeholders on small screens so the page doesn't look endless.
          className={cn(
            "overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
            index >= 2 && index < 4 && "hidden sm:block",
            index >= 4 && "hidden lg:block",
          )}
        >
          <div className="h-40 animate-pulse bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function UserDashboardPage() {
  const navigate = useNavigate();
  const today = DateTime.now().toISODate() ?? "";

  const { data: user } = useCurrentUser();
  const { data: locations = [], isLoading: locationsLoading } = useLocations();
  const { data: roomTypes = [] } = useRoomTypes();
  const reservations = useMyReservations();

  const rooms = useRooms({
    status: "ACTIVE",
    page: 0,
    size: 8,
    sort: "roomNumber,asc",
  });

  const [locationId, setLocationId] = useState("");
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState("10:00");
  const [durationHours, setDurationHours] = useState("2");

  const activeLocations = useMemo(
    () => locations.filter((location) => location.status === "ACTIVE"),
    [locations],
  );

  const roomTypeMap = useMemo(
    () => new Map(roomTypes.map((roomType) => [roomType.id, roomType])),
    [roomTypes],
  );

  const upcoming = useMemo(() => {
    const now = Date.now();
    return [...(reservations.data ?? [])]
      .filter(
        (reservation) =>
          reservation.status !== "CANCELLED" &&
          new Date(reservation.startAt).getTime() >= now,
      )
      .sort(
        (a, b) =>
          new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      );
  }, [reservations.data]);

  const search = (event: FormEvent) => {
    event.preventDefault();
    if (!date) return;
    const params = new URLSearchParams({ date, startTime, durationHours });
    if (locationId) params.set("locationId", locationId);
    navigate(`/user/rooms?${params.toString()}`);
  };

  const roomList = rooms.data?.content ?? [];
  const activeRoomCount = rooms.data?.totalElements ?? roomList.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* ── Hero: greeting ── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 pb-24 pt-8 sm:pt-10 lg:pt-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 h-40 w-40 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <h1 className="max-w-3xl text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
            {user?.firstName
              ? `${getGreeting()}, ${user.firstName}`
              : "Find a room for your next meeting"}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
            Pick a date and time to see which rooms are free.
          </p>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="relative z-10 mx-auto -mt-16 max-w-[1440px] space-y-8 px-4 pb-10 sm:space-y-10 sm:px-6 lg:px-8">
        {/* Search card — overlaps the hero */}
        <form
          onSubmit={search}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 sm:p-5"
        >
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1.3fr_1fr_0.9fr_0.8fr_auto] lg:items-end">
            <Field
              label="Location"
              htmlFor="dash-location"
              icon={<Icon name="map-pin" size={15} />}
              chevron
              className="col-span-2 sm:col-span-1"
            >
              <select
                id="dash-location"
                value={locationId}
                disabled={locationsLoading}
                onChange={(e) => setLocationId(e.target.value)}
                className={selectWithIcon}
              >
                <option value="">All locations</option>
                {activeLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Date"
              htmlFor="dash-date"
              icon={<Icon name="calendar" size={15} />}
              className="col-span-2 sm:col-span-1"
            >
              <input
                id="dash-date"
                type="date"
                required
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className={dateField}
              />
            </Field>

            <Field
              label="Start time"
              htmlFor="dash-start"
              icon={<Icon name="clock" size={15} />}
              chevron
            >
              <select
                id="dash-start"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={selectWithIcon}
              >
                {START_TIMES.map((time) => (
                  <option key={time} value={time}>
                    {DateTime.fromFormat(time, "HH:mm").toFormat("hh:mm a")}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Duration" htmlFor="dash-duration" chevron>
              <select
                id="dash-duration"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className={selectPlain}
              >
                {DURATIONS.map((hours) => (
                  <option key={hours} value={hours}>
                    {hours} {hours === 1 ? "hour" : "hours"}
                  </option>
                ))}
              </select>
            </Field>

            <button
              type="submit"
              className="col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 active:scale-[0.98] lg:col-span-1"
            >
              <Icon name="search" size={15} />
              Find rooms
            </button>
          </div>
        </form>

        {upcoming[0] && (
          <UpcomingBooking
            reservation={upcoming[0]}
            moreCount={upcoming.length - 1}
          />
        )}

        {/* Stats strip */}
        <div className="grid grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          <StatItem
            value={rooms.isLoading ? "—" : activeRoomCount}
            label="Active rooms"
            icon={<Icon name="building" size={18} />}
          />
          <StatItem
            value={locationsLoading ? "—" : activeLocations.length}
            label="Locations"
            icon={<Icon name="map-pin" size={18} />}
          />
          <StatItem
            value={reservations.isLoading ? "—" : upcoming.length}
            label="Upcoming bookings"
            icon={<Icon name="calendar" size={18} />}
          />
        </div>

        {/* Locations */}
        <section className="space-y-5">
          <SectionHeader
            title="Our locations"
            description="Choose a location to see its rooms."
            actionLabel="View all"
            actionTo="/user/rooms"
          />

          {activeLocations.length === 0 ? (
            <StateMessage>
              {locationsLoading
                ? "Loading locations…"
                : "No locations are available right now."}
            </StateMessage>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeLocations.slice(0, 3).map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          )}
        </section>

        {/* Featured rooms */}
        <section className="space-y-5">
          <SectionHeader
            title="Featured rooms"
            description="A selection of rooms you can book today."
            actionLabel="Browse all rooms"
            actionTo="/user/rooms"
          />

          {rooms.isLoading ? (
            <RoomSkeletons count={8} />
          ) : rooms.isError ? (
            <StateMessage
              action={
                <button
                  type="button"
                  onClick={() => void rooms.refetch()}
                  className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Try again
                </button>
              }
            >
              We couldn't load rooms.
            </StateMessage>
          ) : roomList.length === 0 ? (
            <StateMessage>No rooms are available right now.</StateMessage>
          ) : (
            <div className={roomGridClass}>
              {roomList.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  roomType={roomTypeMap.get(room.roomTypeId)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}