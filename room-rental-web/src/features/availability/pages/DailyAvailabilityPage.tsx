import { useEffect, useState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  RefreshCw,
  Users,
  MapPin,
} from "../../../components/ui/MaterialIcon.tsx";
import { DateTime } from "luxon";

import {
  Button,
  Card,
  EmptyState,
  Input,
  LoadingState,
  PageHeader,
  Select,
} from "../../../components/ui";

import { useRooms } from "../../rooms/hooks/useRooms";
import { useMonthAvailability } from "../hooks/useMonthAvailability";
import { MonthlyAvailabilityCalendar } from "../components/MonthlyAvailabilityCalendar";

import { ReservationCreateDialog } from "../../reservations/components/ReservationCreateDialog";
import { useRoomTypes } from "../../room-types/hooks/useRoomTypes";
import type { ReservationCreateInitialState } from "../../reservations/components/ReservationCreateDialog";
import { ReservationDetailsDialog, type ReservationAction } from "../../reservations/components/ReservationDetailsDialog";
import { useReservationStatusMutation } from "../../reservations/hooks/useReservationStatusMutation";
import type { ReservationResponse } from "../../reservations/types/reservation";
import { useOptionalLocationScope } from "../../location-scope/LocationScopeProvider";

export default function DailyAvailabilityPage() {


  const [month, setMonth] = useState<DateTime<true>>(
    DateTime.now().startOf("month") as DateTime<true>,
  );

  const [roomTypeId, setRoomTypeId] = useState<number | "">("");
  const [selectedRoomId, setSelectedRoomId] = useState<number | "">("");

  const [reservationOpen, setReservationOpen] = useState(false);
  const [reservationInitialState, setReservationInitialState] = useState<ReservationCreateInitialState | undefined>(undefined);
  const [createdReservation, setCreatedReservation] = useState<ReservationResponse | null>(null);
  const locationScope = useOptionalLocationScope();
  const confirm = useReservationStatusMutation("confirm");
  const cancel = useReservationStatusMutation("cancel");
  const checkIn = useReservationStatusMutation("checkIn");
  const checkOut = useReservationStatusMutation("checkOut");

  const roomTypesQuery = useRoomTypes();

  const roomTypes =
    roomTypesQuery.data ?? [];

  const roomsQuery = useRooms({
    locationId: locationScope?.currentLocationId ?? undefined,
    roomTypeId:
      roomTypeId === ""
        ? undefined
        : Number(roomTypeId),

    status: "ACTIVE",

    page: 0,

    size: 100,

    sort: "roomNumber,asc",
  });

  const rooms = roomsQuery.data?.content ?? [];


  const selectedRoom = rooms.find(
    (room) => room.id === Number(selectedRoomId),
  );

  // Keep the selected room valid when the room type/filter changes.
  // This must happen in an effect, not during render.
  useEffect(() => {
    if (rooms.length === 0) {
      if (selectedRoomId !== "") {
        setSelectedRoomId("");
      }
      return;
    }

    const selectedStillExists = rooms.some(
      (room) => room.id === Number(selectedRoomId),
    );

    if (!selectedStillExists) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);


  const availabilityQuery = useMonthAvailability(
    selectedRoom?.id ?? 0,
    month.year,
    month.month,
  );


  const handleRoomTypeChange = (value: string) => {
    setRoomTypeId(
      value === ""
        ? ""
        : Number(value),
    );

    setSelectedRoomId("");
  };

  const handleRoomChange = (roomId: number) => {
    setSelectedRoomId(roomId);
  };


  const handleMonthChange = (nextMonth: DateTime) => {
    setMonth(nextMonth.startOf("month") as DateTime<true>);
  };

  const handleToday = () => {
    const today = DateTime.now();

    setMonth(today.startOf("month"));
  };


  const handleNewReservation = () => {
    if (!selectedRoom) {
      return;
    }

    setReservationInitialState({
      locationId: selectedRoom.locationId,
      roomTypeId: selectedRoom.roomTypeId,
      roomId: selectedRoom.id,
      preferredPricingUnitCode: "DAILY",
    });

    setReservationOpen(true);
  };

  const handleDateDoubleClick = (
    date: string,
    day: { status: string },
  ) => {
    if (!selectedRoom) {
      return;
    }

    // Allow a reservation to start on an available or partially-reserved day.
    // The final conflict check still belongs to the reservation/backend flow.
    const canStartReservation =
      day.status === "AVAILABLE" ||
      day.status === "PARTIALLY_RESERVED";

    if (!canStartReservation) {
      return;
    }
    setReservationInitialState({
      locationId: selectedRoom.locationId,
      roomTypeId: selectedRoom.roomTypeId,
      roomId: selectedRoom.id,
      date,
      endDate:date,
      preferredPricingUnitCode: "DAILY",
    });

    setReservationOpen(true);
  };


  const roomTypeOptions = [
    {
      value: "",
      label: "All room types",
    },

    ...roomTypes.map((roomType) => ({
      value: String(roomType.id),
      label: roomType.name,
    })),
  ];


  if (
    locationScope?.isLoading ||
    roomsQuery.isLoading ||
    roomTypesQuery.isLoading
  ) {
    return <LoadingState />;
  }


  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 font-sans text-[#3c4043]">

      <PageHeader
        icon={<CalendarDays size={19} />}
        title="Daily availability"
        actions={
          <Button
            leftIcon={
              <CalendarCheck size={17} />
            }
            disabled={!selectedRoom}
            onClick={handleNewReservation}
          >
            New reservation
          </Button>
        }
      />

      <Card className="border border-[#dadce0] shadow-none">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto]">


          <Select
            id="daily-availability-room-type"
            label="Room type"
            value={
              roomTypeId === ""
                ? ""
                : String(roomTypeId)
            }
            onChange={(event) =>
              handleRoomTypeChange(
                event.target.value,
              )
            }
            options={roomTypeOptions}
          />
          <Input
            id="daily-availability-month"
            label="Month"
            type="month"
            value={month.toFormat("yyyy-MM")}
            onChange={(event) => {
              const value =
                event.target.value;

              if (!value) {
                return;
              }

              const next =
                DateTime.fromFormat(
                  value,
                  "yyyy-MM",
                );

              if (next.isValid) {
                handleMonthChange(next);
              }
            }}
          />


          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={handleToday}
            >
              Today
            </Button>
          </div>
        </div>
      </Card>


      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">


        <Card className="border border-[#dadce0] shadow-none">

          <div className="border-b border-[#dadce0] px-4 py-4">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Rooms
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {rooms.length}{" "}
                  {rooms.length === 1
                    ? "room"
                    : "rooms"}
                </p>
              </div>

              <div className="rounded-lg bg-slate-100 p-2">
                <CalendarDays
                  size={17}
                  className="text-slate-600"
                />
              </div>

            </div>

          </div>


          <div className="max-h-[calc(100vh-280px)] overflow-y-auto p-3">

            {rooms.length === 0 ? (
              <div className="px-3 py-8 text-center">

                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <CalendarDays
                    size={18}
                    className="text-slate-400"
                  />
                </div>

                <p className="text-sm font-medium text-slate-700">
                  No rooms found
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Try selecting another room type.
                </p>

              </div>
            ) : (
              <div className="space-y-2">

                {rooms.map((room) => {

                  const isSelected =
                    room.id ===
                    Number(selectedRoomId);

                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() =>
                        handleRoomChange(
                          room.id,
                        )
                      }
                      className={[
                        "w-full rounded-xl border p-3 text-left transition",
                        "hover:border-slate-300 hover:bg-slate-50",
                        isSelected
                          ? "border-slate-400 bg-slate-50 ring-1 ring-slate-300"
                          : "border-[#dadce0] bg-white",
                      ].join(" ")}
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {room.roomNumber}
                          </p>

                          <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                            {room.name}
                          </p>

                        </div>

                        {isSelected && (
                          <span className="shrink-0 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-medium text-white">
                            Selected
                          </span>
                        )}

                      </div>
                    </button>
                  );
                })}

              </div>
            )}

          </div>

        </Card>

        <div className="min-w-0">


          {!selectedRoom && (
            <Card className="border border-[#dadce0] shadow-none">

              <EmptyState
                title="Select a room"
                description="Choose a room from the room list to view its availability for the selected month."
              />

            </Card>
          )}

          {selectedRoom && (
            <Card className="border border-[#dadce0] shadow-none">


              <div className="border-b border-[#dadce0] px-5 py-4">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <div className="flex items-center gap-2">

                      <h2 className="text-base font-semibold text-slate-900">
                        {selectedRoom.roomNumber}
                      </h2>

                      <span className="text-slate-400">
                        ·
                      </span>

                      <h3 className="text-base font-medium text-slate-700">
                        {selectedRoom.name}
                      </h3>

                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">

                      <span className="inline-flex items-center gap-1.5">
                        <Users size={14} />
                        Capacity:{" "}
                        {selectedRoom.capacity}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} />
                        {selectedRoom.locationName}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        {selectedRoom.roomTypeName}
                      </span>

                    </div>

                  </div>

                  <Button
                    variant="secondary"
                    loading={
                      availabilityQuery.isFetching
                    }
                    leftIcon={
                      <RefreshCw size={16} />
                    }
                    onClick={() =>
                      availabilityQuery.refetch()
                    }
                  >
                    Refresh
                  </Button>

                </div>

              </div>

              {availabilityQuery.isError && (
                <div className="p-5">

                  <EmptyState
                    title="Unable to load availability"
                    description="Something went wrong while loading the room calendar."
                    action={
                      <Button
                        variant="secondary"
                        onClick={() =>
                          availabilityQuery.refetch()
                        }
                      >
                        Try again
                      </Button>
                    }
                  />

                </div>
              )}

              {!availabilityQuery.isError && (
                <div className="p-5">

                  {availabilityQuery.isLoading ? (
                    <LoadingState />
                  ) : (
                    <MonthlyAvailabilityCalendar
                      month={month}
                      days={availabilityQuery.data?.days ?? []}
                      onPreviousMonth={() =>
                        handleMonthChange(
                          month.minus({ months: 1 }),
                        )
                      }
                      onNextMonth={() =>
                        handleMonthChange(
                          month.plus({ months: 1 }),
                        )
                      }
                      onDateDoubleClick={handleDateDoubleClick}
                    />
                  )}

                </div>
              )}

            </Card>
          )}

        </div>

      </div>

      {reservationOpen && selectedRoom && (
        <ReservationCreateDialog
          open={true}
          onClose={() => setReservationOpen(false)}
          initialState={reservationInitialState}
          onCreated={(reservation) => setCreatedReservation(reservation)}
        />
      )}

      <ReservationDetailsDialog
        reservation={createdReservation}
        onClose={() => setCreatedReservation(null)}
        onAction={(action: ReservationAction, reservation: ReservationResponse) => {
          const mutation = { confirm, cancel, checkIn, checkOut }[action];
          void mutation.mutateAsync(reservation.id).then(setCreatedReservation);
        }}
        loadingAction={
          confirm.isPending ? "confirm" : cancel.isPending ? "cancel" : checkIn.isPending ? "checkIn" : checkOut.isPending ? "checkOut" : null
        }
        showWorkflowActions
      />




    </div>
  );
}