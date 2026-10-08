import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DateTime } from "luxon";

import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useLocations } from "../../locations/hooks/useLocations";
import { useRoomTypes } from "../../room-types/hooks/useRoomTypes";
import { useRooms } from "../../rooms/hooks/useRooms";


import {
  Button,
  Card,
  Icon,
  Input,
  SelectInput,
  SectionTitle,
  PageLoading,
  RoomPlaceholder,
} from "../components/UserUI";

import { RoomCard } from "../components/RoomCard";
import { LocationCard } from "../components/LocationCard";
import { useMyReservations } from "../hooks/useMyReservation";

export default function UserDashboardPage() {
  const navigate = useNavigate();

  const { data: user } = useCurrentUser();
  const { data: locations = [] } = useLocations();
  const { data: roomTypes = [] } = useRoomTypes();

  const rooms = useRooms({
    status: "ACTIVE",
    page: 0,
    size: 8,
    sort: "roomNumber,asc",
  });

  const reservations = useMyReservations();

  const [locationId, setLocationId] = useState("");
  const [date, setDate] = useState(
    DateTime.now().toISODate() ?? "",
  );
  const [startTime, setStartTime] = useState("10:00");

  const activeLocations = useMemo(
    () =>
      locations.filter(
        (location) => location.status === "ACTIVE",
      ),
    [locations],
  );

  const roomTypeMap = useMemo(
    () =>
      new Map(
        roomTypes.map((roomType) => [
          roomType.id,
          roomType,
        ]),
      ),
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
          new Date(a.startAt).getTime() -
          new Date(b.startAt).getTime(),
      );
  }, [reservations.data]);

  const search = () => {
    const params = new URLSearchParams();

    if (locationId) {
      params.set("locationId", locationId);
    }

    if (date) {
      params.set("date", date);
    }

    if (startTime) {
      params.set("startTime", startTime);
    }

    navigate(
      `/user/rooms?${params.toString()}`,
    );
  };

  if (rooms.isLoading) {
    return <PageLoading />;
  }

  return (
    <div>
      {/* HERO */}

      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-blue-950/30" />

        <div className="relative mx-auto grid max-w-[1440px] gap-10 px-4 py-12 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              RoomRental
            </p>

            <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Find a room for your next meeting
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400">
              Welcome back,{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {user?.firstName ?? "there"}
              </span>
              . Find a suitable room and reserve it in just a few steps.
            </p>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900">
              <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto]">
                <SelectInput
                  value={locationId}
                  onChange={(event) =>
                    setLocationId(event.target.value)
                  }
                >
                  <option value="">
                    All locations
                  </option>

                  {activeLocations.map((location) => (
                    <option
                      key={location.id}
                      value={location.id}
                    >
                      {location.name}
                    </option>
                  ))}
                </SelectInput>

                <Input
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(event.target.value)
                  }
                  min={
                    DateTime.now().toISODate() ?? undefined
                  }
                />

                <Input
                  type="time"
                  value={startTime}
                  onChange={(event) =>
                    setStartTime(event.target.value)
                  }
                />

                <Button
                  onClick={search}
                  leftIcon={<Icon name="search" size={17} />}
                  className="h-[46px]"
                >
                  Search
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-2">
                <Icon name="check" size={16} className="text-emerald-500" />
                Real-time availability
              </span>

              <span className="inline-flex items-center gap-2">
                <Icon name="calendar" size={16} className="text-blue-500" />
                Hourly & daily booking
              </span>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative h-full min-h-[360px] overflow-hidden rounded-[32px] bg-white shadow-2xl shadow-slate-900/10 dark:bg-slate-900">
              {roomTypes[0]?.imageUrl ? (
                <img
                  src={roomTypes[0].imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <RoomPlaceholder className="h-full w-full" />
              )}

              <div className="absolute inset-x-6 bottom-6 rounded-2xl border border-white/60 bg-white/90 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/85">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  Explore
                </p>

                <p className="mt-1 font-bold text-slate-950 dark:text-white">
                  Comfortable spaces for work, meetings and events.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] space-y-12 px-4 py-10 lg:px-8">
        {/* UPCOMING */}

        {upcoming[0] && (
          <Card className="overflow-hidden border-blue-100 bg-blue-50/70 dark:border-blue-900/50 dark:bg-blue-950/20">
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                  Your next reservation
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
                  {upcoming[0].roomName}
                </h2>

                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {DateTime.fromISO(upcoming[0].startAt).toFormat(
                    "dd MMM yyyy · HH:mm",
                  )}{" "}
                  —{" "}
                  {DateTime.fromISO(upcoming[0].endAt).toFormat(
                    "HH:mm",
                  )}
                </p>
              </div>

              <Link to="/user/reservations">
                <Button variant="secondary">
                  View reservation
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* LOCATIONS */}

        <section className="space-y-5">
          <SectionTitle
            title="Our locations"
            description="Choose a location and explore its available rooms."
            action={
              <Link
                to="/user/rooms"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View all
              </Link>
            }
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeLocations.slice(0, 3).map((location) => (
              <LocationCard
                key={location.id}
                location={location}
              />
            ))}
          </div>
        </section>

        {/* ROOMS */}

        <section className="space-y-5">
          <SectionTitle
            title="Recommended rooms"
            description="Explore some of the rooms currently available in the system."
            action={
              <Link
                to="/user/rooms"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Browse all
              </Link>
            }
          />

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {(rooms.data?.content ?? []).map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                roomType={roomTypeMap.get(room.roomTypeId)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}