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

const fieldClass =
  "w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-slate-800 outline-none transition " +
  "focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 " +
  "dark:border-slate-700 dark:bg-slate-800 dark:text-white";

const roomGridClass =
  "grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4";

/* ─────────────────────────────────────────────
   Small building blocks
───────────────────────────────────────────── */
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
    <div className="flex items-end justify-between gap-4">
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
    <div className="flex items-center gap-3 px-5 py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-none tracking-tight text-slate-950 dark:text-white">
          {value}
        </p>
        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>
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
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {/* Date tile */}
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <span className="text-[11px] font-medium leading-none opacity-80">
              {start.toFormat("MMM")}
            </span>
            <span className="mt-1 text-2xl font-bold leading-none">
              {start.toFormat("dd")}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
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

        <div className="flex shrink-0 items-center gap-3">
          {moreCount > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              +{moreCount} more upcoming
            </span>
          )}
          <Link
            to="/user/reservations"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-blue-200 transition hover:bg-blue-100 dark:bg-slate-900 dark:text-blue-300 dark:ring-blue-500/30 dark:hover:bg-slate-800"
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
          className="h-72 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
        />
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
  const { data: locations = [] } = useLocations();
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
    const params = new URLSearchParams({ date, startTime, durationHours });
    if (locationId) params.set("locationId", locationId);
    navigate(`/user/rooms?${params.toString()}`);
  };

  const roomList = rooms.data?.content ?? [];
  const activeRoomCount = rooms.data?.totalElements ?? roomList.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* ── Hero: greeting + search ── */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            {user?.firstName
              ? `Welcome back, ${user.firstName}`
              : "Find a room for your next meeting"}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Pick a date and time to see which rooms are free.
          </p>

          <form
            onSubmit={search}
            className="mt-6 w-full max-w-5xl rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950"
          >
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_0.9fr_0.8fr_auto]">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="map-pin" size={15} />
                </span>
                <select
                  aria-label="Location"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className={fieldClass}
                >
                  <option value="">All locations</option>
                  {activeLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="calendar" size={15} />
                </span>
                <input
                  aria-label="Date"
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => setDate(e.target.value)}
                  className={cn(
                    fieldClass,
                    "[color-scheme:light] dark:[color-scheme:dark]",
                  )}
                />
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="clock" size={15} />
                </span>
                <select
                  aria-label="Start time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={fieldClass}
                >
                  {START_TIMES.map((time) => (
                    <option key={time} value={time}>
                      {DateTime.fromFormat(time, "HH:mm").toFormat("hh:mm a")}
                    </option>
                  ))}
                </select>
              </div>

              <select
                aria-label="Duration"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className={cn(fieldClass, "pl-3")}
              >
                {DURATIONS.map((hours) => (
                  <option key={hours} value={hours}>
                    {hours} {hours === 1 ? "hour" : "hours"}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 active:scale-[0.98]"
              >
                <Icon name="search" size={15} />
                Find rooms
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="mx-auto max-w-[1440px] space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        {upcoming[0] && (
          <UpcomingBooking
            reservation={upcoming[0]}
            moreCount={upcoming.length - 1}
          />
        )}

        {/* Stats strip */}
        <div className="grid grid-cols-1 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <StatItem
            value={activeRoomCount}
            label="Active rooms"
            icon={<Icon name="building" size={18} />}
          />
          <StatItem
            value={activeLocations.length}
            label="Locations"
            icon={<Icon name="map-pin" size={18} />}
          />
          <StatItem
            value={upcoming.length}
            label="Your upcoming bookings"
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
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No locations are available right now.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
            <p className="text-sm text-slate-500 dark:text-slate-400">
              We couldn't load rooms. Refresh the page to try again.
            </p>
          ) : roomList.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No rooms are available right now.
            </p>
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