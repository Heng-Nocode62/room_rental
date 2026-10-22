import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DateTime } from "luxon";

import { useRoom } from "../../rooms/hooks/useRoom";
import { useRoomTypes } from "../../room-types/hooks/useRoomTypes";
import { useLocations } from "../../locations/hooks/useLocations";
import { useDayAvailability } from "../../availability/hooks/useDayAvailability";
import { useMonthAvailability } from "../../availability/hooks/useMonthAvailability";

import {
  Button,
  Card,
  Icon,
  PageLoading,
  RoomPlaceholder,
  StatusBadge,
  cn,
} from "../components/UserUI";

import { BookingDialogWithQr } from "../../payments/components/BookingDialogWithQr";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** "HH:mm" from "09:00", "09:00:00" or "2026-10-09T09:00:00". */
function timePart(value: string) {
  const part = value.includes("T") ? (value.split("T").pop() ?? value) : value;
  return part.slice(0, 5);
}

/** Works for "09:00", "09:00:00" and "2026-10-09T09:00:00". */
function formatTime(value: string) {
  const timePart = value.includes("T") ? (value.split("T").pop() ?? value) : value;
  const parsed = DateTime.fromFormat(timePart.slice(0, 5), "HH:mm");
  return parsed.isValid ? parsed.toFormat("hh:mm a") : value;
}

function dayLabel(iso: string) {
  const day = DateTime.fromISO(iso).startOf("day");
  const diff = Math.round(day.diff(DateTime.now().startOf("day"), "days").days);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return day.toFormat("ccc, dd MMM");
}

const statusDot: Record<string, string> = {
  AVAILABLE: "bg-emerald-500",
  PARTIALLY_RESERVED: "bg-amber-500",
  FULLY_RESERVED: "bg-rose-500",
  BLOCKED: "bg-slate-400",
  CLOSED: "bg-slate-400",
};

export default function UserRoomDetailsPage() {
  const params = useParams();
  const roomId = Number(params.id);
  const today = DateTime.now().toISODate()!;

  const room = useRoom(roomId);
  const { data: roomTypes = [] } = useRoomTypes();
  const { data: locations = [] } = useLocations();

  // `date` is the selected day; `viewMonth` is the month shown in the calendar.
  // They are separate so browsing months doesn't change the selected day.
  const [date, setDate] = useState(today);
  const [viewMonth, setViewMonth] = useState(() =>
    DateTime.now().startOf("month"),
  );
  const [bookingOpen, setBookingOpen] = useState(false);
  // The slot the person clicked; used to pre-fill the dialog's start and end time.
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);

  const selectedRoom = room.data;
  const roomType = roomTypes.find((item) => item.id === selectedRoom?.roomTypeId);
  const location = locations.find((item) => item.id === selectedRoom?.locationId);
  const timezone = location?.timeZone || "Asia/Phnom_Penh";

  // A slot has passed once its start time is behind us in the location's timezone.
  const slotHasPassed = (slot: { start: string }) =>
    DateTime.fromISO(`${date}T${timePart(slot.start)}`, { zone: timezone }) <=
    DateTime.now();

  const monthAvailability = useMonthAvailability(
    roomId,
    viewMonth.year,
    viewMonth.month,
  );
  const dayAvailability = useDayAvailability(roomId, date);

  // Luxon weeks start on Monday, so the header above is Monday-first too.
  const calendarDays = useMemo(() => {
    const start = viewMonth.startOf("month").startOf("week");
    return Array.from({ length: 42 }, (_, index) => start.plus({ days: index }));
  }, [viewMonth]);

  const availabilityMap = useMemo(
    () =>
      new Map(
        (monthAvailability.data?.days ?? []).map((day) => [day.date, day.status]),
      ),
    [monthAvailability.data?.days],
  );

  // Keep every slot (available, reserved, blocked) so people can see why a time is taken.
  const allSlots = useMemo(
    () =>
      [...(dayAvailability.data?.slots ?? [])].sort((a, b) =>
        a.start.localeCompare(b.start),
      ),
    [dayAvailability.data?.slots],
  );
  const availableSlots = useMemo(
    () =>
      allSlots.filter(
        (slot) => slot.status === "AVAILABLE" && !slotHasPassed(slot),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allSlots, date, timezone],
  );

  const priceFor = (unit: "HOURLY" | "DAILY") => {
    const eligible = (selectedRoom?.prices ?? [])
      .filter((price) => price.pricingUnitCode.toUpperCase() === unit)
      .filter((price) => price.effectiveFrom <= date)
      .filter((price) => !price.effectiveTo || price.effectiveTo >= date)
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
    return eligible.find((price) => price.status === "ACTIVE") ?? eligible[0];
  };

  if (room.isLoading) {
    return <PageLoading />;
  }

  if (room.isError || !selectedRoom) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-lg font-bold text-slate-950 dark:text-white">
          We couldn't find this room
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          It may have been removed or is no longer available.
        </p>
        <Link
          to="/user/rooms"
          className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Back to rooms
        </Link>
      </div>
    );
  }

  const amenities = selectedRoom.amenities ?? [];
  const hourly = priceFor("HOURLY");
  const daily = priceFor("DAILY");
  const locationName = location?.name ?? selectedRoom.locationName;
  const canGoBack = viewMonth > DateTime.now().startOf("month");
  const formatPrice = (value: number) =>
    value.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-360 space-y-6 px-4 py-6 lg:px-8">
        <Link
          to="/user/rooms"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <Icon name="chevron-left" size={16} />
          Back to rooms
        </Link>

        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            {selectedRoom.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="map-pin" size={15} />
              {locationName}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="building" size={15} />
              Room {selectedRoom.roomNumber}
              {selectedRoom.floor ? `, floor ${selectedRoom.floor}` : ""}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="users" size={15} />
              Up to {selectedRoom.capacity} people
            </span>
          </div>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_420px]">
          {/* ── Left: room info ── */}
          <div className="min-w-0 space-y-8">
            <div className="overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
              {selectedRoom.imageUrl || roomType?.imageUrl ? (
                <img
                  src={selectedRoom.imageUrl || roomType?.imageUrl || ""}
                  alt={selectedRoom.name}
                  className="aspect-16/10 w-full object-cover"
                />
              ) : (
                <RoomPlaceholder className="aspect-16/10 w-full" />
              )}
            </div>

            <section>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                About this room
              </h2>
              <p className="mt-2 max-w-2xl leading-7 text-slate-600 dark:text-slate-400">
                {selectedRoom.description ||
                  roomType?.description ||
                  "A comfortable space suitable for meetings and focused work."}
              </p>
            </section>

            {amenities.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                  What's included
                </h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {amenities.map((amenity) => (
                    <li
                      key={amenity.amenityId}
                      className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <Icon name="check" size={15} className="shrink-0 text-blue-600 dark:text-blue-400" />
                      <span className="truncate">{amenity.name}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* ── Right: price + booking (sticky on desktop) ── */}
          <aside className="lg:sticky lg:top-21">
            <Card className="overflow-hidden">
              {/* Price */}
              <div className="border-b border-slate-200 p-5 dark:border-slate-800">
                {hourly ? (
                  <p className="text-2xl font-extrabold text-slate-950 dark:text-white">
                    {formatPrice(hourly.price)} {hourly.currencyCode}
                    <span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                      / hour
                    </span>
                  </p>
                ) : (
                  <p className="text-base font-semibold text-slate-500 dark:text-slate-400">
                    Hourly price unavailable
                  </p>
                )}
                {daily && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {formatPrice(daily.price)} {daily.currencyCode} / day
                  </p>
                )}
              </div>

              {/* Calendar */}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    aria-label="Previous month"
                    disabled={!canGoBack}
                    onClick={() => setViewMonth((month) => month.minus({ months: 1 }))}
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Icon name="chevron-left" size={17} />
                  </button>

                  <h2 className="text-sm font-bold text-slate-950 dark:text-white">
                    {viewMonth.toFormat("MMMM yyyy")}
                  </h2>

                  <button
                    type="button"
                    aria-label="Next month"
                    onClick={() => setViewMonth((month) => month.plus({ months: 1 }))}
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Icon name="chevron-right" size={17} />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400">
                  {WEEKDAYS.map((day) => (
                    <div key={day} className="py-1.5">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((calendarDay) => {
                    const dayIso = calendarDay.toISODate()!;
                    const status = availabilityMap.get(dayIso);
                    const selected = dayIso === date;
                    const outside = calendarDay.month !== viewMonth.month;
                    const past = dayIso < today;
                    const disabled =
                      past ||
                      status === "FULLY_RESERVED" ||
                      status === "BLOCKED" ||
                      status === "CLOSED";

                    if (outside) {
                      return <div key={dayIso} className="h-10" aria-hidden="true" />;
                    }

                    return (
                      <button
                        type="button"
                        key={dayIso}
                        disabled={disabled}
                        aria-pressed={selected}
                        aria-label={calendarDay.toFormat("cccc, d MMMM")}
                        onClick={() => setDate(dayIso)}
                        className={cn(
                          "relative flex h-10 items-center justify-center rounded-lg text-xs font-semibold transition",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                          selected
                            ? "bg-blue-600 text-white"
                            : disabled
                              ? "cursor-not-allowed text-slate-300 dark:text-slate-700"
                              : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                          dayIso === today && !selected && "ring-1 ring-inset ring-blue-300 dark:ring-blue-500/50",
                        )}
                      >
                        {calendarDay.day}
                        {!selected && !past && status && (
                          <span
                            className={cn(
                              "absolute bottom-1 h-1 w-1 rounded-full",
                              statusDot[status] ?? "bg-slate-400",
                            )}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Available
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Partly booked
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    Fully booked
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                    Closed
                  </span>
                </div>
              </div>

              {/* Time slots */}
              <div className="border-t border-slate-200 p-5 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                      {dayLabel(date)}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {DateTime.fromISO(date).toFormat("dd MMM yyyy")}
                    </p>
                  </div>
                  {allSlots.length > 0 && (
                    <StatusBadge
                      status={availableSlots.length > 0 ? "AVAILABLE" : "FULLY_RESERVED"}
                    />
                  )}
                </div>

                <div className="mt-4">
                  {dayAvailability.isLoading ? (
                    <div className="grid grid-cols-2 gap-2" aria-hidden="true">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                        />
                      ))}
                    </div>
                  ) : dayAvailability.isError ? (
                    <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      We couldn't load times for this day. Pick another date or try again.
                    </p>
                  ) : allSlots.length === 0 ? (
                    <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      This room has no bookable times on this date. It may be closed.
                    </p>
                  ) : (
                    <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto overscroll-contain pr-1">
                      {allSlots.map((slot) => {
                        const key = `${slot.start}-${slot.end}`;
                        const label = `${formatTime(slot.start)} – ${formatTime(slot.end)}`;

                        if (slot.status === "AVAILABLE" && !slotHasPassed(slot)) {
                          return (
                            <button
                              type="button"
                              key={key}
                              onClick={() => {
                                setSelectedSlot({ start: slot.start, end: slot.end });
                                setBookingOpen(true);
                              }}
                              className="rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                            >
                              {label}
                            </button>
                          );
                        }

                        return (
                          <div
                            key={key}
                            title={slot.status === "BLOCKED" ? slot.reason : undefined}
                            className="rounded-xl bg-slate-100 px-2 py-2 text-center text-xs text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                          >
                            <span className="block font-semibold line-through">{label}</span>
                            <span className="block text-[10px]">
                              {slot.status === "AVAILABLE"
                                ? "Passed"
                                : slot.status === "RESERVED"
                                  ? "Booked"
                                  : "Unavailable"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {allSlots.length > 0 && availableSlots.length === 0 && (
                  <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    {date === today
                      ? "All of today's times have passed or are taken."
                      : "No times left to book on this date."}
                  </p>
                )}

                <Button
                  className="mt-5 w-full"
                  leftIcon={<Icon name="calendar" size={17} />}
                  onClick={() => {
                    setSelectedSlot(null);
                    setBookingOpen(true);
                  }}
                  disabled={availableSlots.length === 0}
                >
                  Reserve this room
                </Button>
              </div>
            </Card>
          </aside>
        </div>
      </div>

      <BookingDialogWithQr
        open={bookingOpen}
        onClose={() => {
          setBookingOpen(false);
          setSelectedSlot(null);
        }}
        room={selectedRoom}
        roomType={roomType}
        location={location}
        initialDate={date}
        initialStartTime={selectedSlot ? timePart(selectedSlot.start) : undefined}
        initialEndTime={selectedSlot ? timePart(selectedSlot.end) : undefined}
        onCreated={() => {
          setBookingOpen(false);
          setSelectedSlot(null);
        }}
      />
    </div>
  );
}