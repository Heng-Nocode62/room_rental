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
} from "../components/UserUI";

import { BookingDialog } from "../components/BookingDialog";

export default function UserRoomDetailsPage() {
  const params = useParams();
  const roomId = Number(params.id);

  const room = useRoom(roomId);
  const { data: roomTypes = [] } = useRoomTypes();
  const { data: locations = [] } = useLocations();

  const [date, setDate] = useState(
    DateTime.now().toISODate()!,
  );

  const selectedRoom = room.data;

  const roomType = roomTypes.find(
    (item) =>
      item.id === selectedRoom?.roomTypeId,
  );

  const location = locations.find(
    (item) =>
      item.id === selectedRoom?.locationId,
  );

  const currentDate = DateTime.fromISO(date);

  const monthAvailability =
    useMonthAvailability(
      roomId,
      currentDate.year,
      currentDate.month,
    );

  const dayAvailability =
    useDayAvailability(roomId, date);

  const [bookingOpen, setBookingOpen] =
    useState(false);

  const calendarDays = useMemo(() => {
    const start =
      currentDate.startOf("month").startOf("week");

    return Array.from({ length: 42 }, (_, index) =>
      start.plus({ days: index }),
    );
  }, [
    currentDate.year,
    currentDate.month,
  ]);

  if (room.isLoading) {
    return <PageLoading />;
  }

  if (room.isError || !selectedRoom) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-lg font-bold">
          Room not found
        </p>

        <Link
          to="/user/rooms"
          className="mt-3 inline-block text-sm font-semibold text-blue-600"
        >
          Back to rooms
        </Link>
      </div>
    );
  }

  const availabilityMap = new Map(
    (
      monthAvailability.data?.days ?? []
    ).map((day) => [
      day.date,
      day.status,
    ]),
  );

  const availableSlots =
    dayAvailability.data?.slots?.filter(
      (slot) =>
        slot.status === "AVAILABLE",
    ) ?? [];

  const handleDateChange = (
    nextDate: string,
  ) => {
    setDate(nextDate);
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-8 px-4 py-8 lg:px-8">
      <Link
        to="/user/rooms"
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400"
      >
        <Icon name="chevron-left" size={16} />
        Back to rooms
      </Link>

      {/* HEADER */}

      <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <div className="overflow-hidden rounded-3xl">
          {roomType?.imageUrl ? (
            <img
              src={roomType.imageUrl}
              alt={roomType.name}
              className="aspect-[1.35] w-full object-cover"
            />
          ) : (
            <RoomPlaceholder className="aspect-[1.35] w-full" />
          )}
        </div>

        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {roomType?.name ??
                  selectedRoom.roomTypeName}
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                {selectedRoom.name}
              </h1>
            </div>

            <button
              type="button"
              className="rounded-full border border-slate-200 p-2.5 text-rose-500 dark:border-slate-700"
            >
              <Icon name="heart" size={18} />
            </button>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-2">
              <Icon name="map-pin" size={16} />
              {location?.name ?? "Location"}
            </span>

            <span className="inline-flex items-center gap-2">
              <Icon name="building" size={16} />
              Floor {selectedRoom.floor ?? "—"}
            </span>

            <span className="inline-flex items-center gap-2">
              <Icon name="users" size={16} />
              {selectedRoom.capacity} people
            </span>
          </div>

          <p className="text-2xl font-black text-slate-950 dark:text-white">
            {selectedRoom.prices.find(
              (price) =>
                price.pricingUnitCode ===
                "HOURLY",
            )?.price?.toFixed(2) ?? "—"}{" "}
            <span className="text-sm font-semibold text-slate-400">
              / hour
            </span>
          </p>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
              About this room
            </h2>

            <p className="mt-2 leading-7 text-slate-600 dark:text-slate-400">
              {selectedRoom.description ||
                roomType?.description ||
                "A comfortable space suitable for meetings and focused work."}
            </p>
          </div>
        </div>
      </div>

      {/* AMENITIES */}

      {selectedRoom.amenities.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">
            Amenities
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            {selectedRoom.amenities.map(
              (amenity) => (
                <div
                  key={amenity.amenityId}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  <Icon
                    name="check"
                    size={15}
                    className="text-blue-500"
                  />

                  {amenity.name}
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {/* AVAILABILITY */}

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                const previous =
                  currentDate.minus({
                    months: 1,
                  });

                setDate(
                  previous
                    .startOf("month")
                    .toISODate()!,
                );
              }}
              className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Icon
                name="chevron-left"
                size={17}
              />
            </button>

            <h2 className="font-bold text-slate-950 dark:text-white">
              {currentDate.toFormat("MMMM yyyy")}
            </h2>

            <button
              type="button"
              onClick={() => {
                const next =
                  currentDate.plus({
                    months: 1,
                  });

                setDate(
                  next
                    .startOf("month")
                    .toISODate()!,
                );
              }}
              className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Icon
                name="chevron-right"
                size={17}
              />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ),
            )}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((calendarDay) => {
              const dayIso =
                calendarDay.toISODate()!;

              const status =
                availabilityMap.get(dayIso);

              const selected =
                dayIso === date;

              const outside =
                calendarDay.month !==
                currentDate.month;

              return (
                <button
                  type="button"
                  key={dayIso}
                  disabled={outside}
                  onClick={() =>
                    handleDateChange(dayIso)
                  }
                  className={[
                    "relative flex h-10 items-center justify-center rounded-lg text-xs font-semibold transition",
                    outside
                      ? "text-slate-300 dark:text-slate-700"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                    selected
                      ? "bg-blue-600 text-white hover:bg-blue-600"
                      : "",
                  ].join(" ")}
                >
                  {calendarDay.day}

                  {!selected &&
                    status && (
                      <span
                        className={[
                          "absolute bottom-1 h-1 w-1 rounded-full",
                          status === "AVAILABLE"
                            ? "bg-emerald-500"
                            : status ===
                                "PARTIALLY_RESERVED"
                              ? "bg-amber-500"
                              : status ===
                                  "FULLY_RESERVED"
                                ? "bg-rose-500"
                                : "bg-slate-400",
                        ].join(" ")}
                      />
                    )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Available
            </span>

            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Partially reserved
            </span>

            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Fully reserved
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Availability
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
                {currentDate.toFormat("dd MMM yyyy")}
              </h2>
            </div>

            {dayAvailability.data && (
              <StatusBadge
                status={
                  availableSlots.length > 0
                    ? "AVAILABLE"
                    : "FULLY_RESERVED"
                }
              />
            )}
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-bold text-slate-950 dark:text-white">
              Available time slots
            </p>

            {availableSlots.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                No available slots on this date.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {availableSlots.map(
                  (slot) => (
                    <button
                      type="button"
                      key={`${slot.start}-${slot.end}`}
                      onClick={() =>
                        setBookingOpen(true)
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                    >
                      {slot.start.slice(0, 5)} –{" "}
                      {slot.end.slice(0, 5)}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
            <Button
              className="w-full"
              leftIcon={
                <Icon
                  name="calendar"
                  size={17}
                />
              }
              onClick={() =>
                setBookingOpen(true)
              }
              disabled={
                availableSlots.length === 0
              }
            >
              Reserve this room
            </Button>
          </div>
        </Card>
      </section>

      <BookingDialog
        open={bookingOpen}
        onClose={() =>
          setBookingOpen(false)
        }
        room={selectedRoom}
        roomType={roomType}
        location={location}
        initialDate={date}
        onCreated={() =>
          setBookingOpen(false)
        }
      />
    </div>
  );
}