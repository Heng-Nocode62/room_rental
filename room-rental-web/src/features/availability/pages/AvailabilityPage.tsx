import { useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { CalendarCheck, RefreshCw } from "../../../components/ui/MaterialIcon.tsx";

import { roomPriceApi } from "../../pricing/api/roomPriceApi";

import { DateTime } from "luxon";

import {
  Button,
  Card,
  EmptyState,
  Input,
  LoadingState,
  Select,
  PageHeader,
} from "../../../components/ui";
import { ReservationCreateDialog } from "../../reservations/components/ReservationCreateDialog";

import { DateStrip } from "../../../components/ui/DateStrip";

import { useRoomTypes } from "../../room-types/hooks/useRoomTypes";

import { useLocations } from "../../locations/hooks/useLocations";

import { useDayAvailabilityOverview } from "../hooks/useDayAvailabilityOverview";

import type {
  RoomAvailabilityResponse,
  TimeSlotResponse,
} from "../types/availability";
import { getTimelineRange } from "../utils/timeline";
import { useTranslation } from "react-i18next";
import type { ReservationCreateInitialState } from "../../reservations/components/ReservationCreateDialog";
import { AvailabilityGrid } from "../components/AvailableGrid.tsx";
import { AvailabilityMobileList } from "../components/AvailabilityMobileList.tsx";
import { ReservationDetailsDialog, type ReservationAction } from "../../reservations/components/ReservationDetailsDialog";
import { useReservationStatusMutation } from "../../reservations/hooks/useReservationStatusMutation";
import type { ReservationResponse } from "../../reservations/types/reservation";
import { useOptionalLocationScope } from "../../location-scope/LocationScopeProvider";

export default function AvailabilityPage() {
  const { t } = useTranslation();
  const locationScope = useOptionalLocationScope();
  const [createdReservation, setCreatedReservation] =
    useState<ReservationResponse | null>(null);
  const confirm = useReservationStatusMutation("confirm");
  const cancel = useReservationStatusMutation("cancel");
  const checkIn = useReservationStatusMutation("checkIn");
  const checkOut = useReservationStatusMutation("checkOut");

  // FILTER STATE
  const [date, setDate] = useState(DateTime.now().toISODate() ?? "");
  const [roomTypeId, setRoomTypeId] = useState<number | "">("");
  const [locationId, setLocationId] = useState<number | "">(
    () => locationScope?.currentLocationId ?? "",
  );

  const [reservationOpen, setReservationOpen] = useState(false);
  const [reservationInitialState, setReservationInitialState] =
    useState<ReservationCreateInitialState | undefined>(undefined);

  useEffect(() => {
    if (!locationScope?.currentLocationId) return;
    setLocationId(locationScope.currentLocationId);
  }, [locationScope?.currentLocationId]);

  const {
    data: roomTypes,
    isLoading: roomTypesLoading,
    isError: roomTypesError,
  } = useRoomTypes();

  const {
    data: locations,
    isLoading: locationsLoading,
    isError: locationsError,
  } = useLocations();

  const { data, isLoading, isFetching, isError, refetch } =
    useDayAvailabilityOverview(
      date,
      roomTypeId === "" ? undefined : roomTypeId,
      locationId === "" ? undefined : locationId,
    );

  const priceQueries = useQueries({
    queries: (data?.rooms ?? []).map((room) => ({
      queryKey: ["room-prices", "availability", room.roomId, date],
      queryFn: () =>
        roomPriceApi.search({
          roomId: room.roomId,
          status: "ACTIVE",
          effectiveDate: date,
          page: 0,
          size: 20,
        }),
      staleTime: 60_000,
    })),
  });

  const hourlyPrices = useMemo(() => {
    const map: Record<number, { price: number; currencyCode: string }> = {};
    (data?.rooms ?? []).forEach((room, index) => {
      const price = priceQueries[index]?.data?.content?.find(
        (item: any) => item.pricingUnitCode === "HOURLY",
      );
      if (price)
        map[room.roomId] = {
          price: price.price,
          currencyCode: price.currencyCode,
        };
    });
    return map;
  }, [data?.rooms, priceQueries]);

  const timeline = useMemo(() => getTimelineRange(data?.rooms ?? []), [data]);

  /** Desktop: double-click a cell. Phone: tap a slot chip. */
  const handleSlotSelect = (
    room: RoomAvailabilityResponse,
    slot: TimeSlotResponse,
  ) => {
    if (slot.status !== "AVAILABLE") return;
    setReservationInitialState({
      locationId: room.locationId,
      roomId: room.roomId,
      roomTypeId: room.roomTypeId,
      date,
      startTime: slot.start,
      endTime: slot.end,
      preferredPricingUnitCode: "HOURLY",
    });
    setReservationOpen(true);
  };

  if (locationScope?.isLoading || roomTypesLoading || locationsLoading) {
    return <LoadingState />;
  }

  if (roomTypesError || locationsError) {
    return (
      <EmptyState
        title="Unable to load filters"
        description="Room types and locations are required to view availability."
      />
    );
  }

  const hasRooms = !isLoading && !isError && data && data.rooms.length > 0;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 px-4 pb-6 font-sans text-[#3c4043] sm:space-y-5 sm:px-6 lg:px-0">
      <PageHeader
        icon={<CalendarCheck size={19} />}
        title={t("availability")}
        actions={
          <Button
            leftIcon={<CalendarCheck size={17} />}
            disabled={locationId === ""}
            className="w-full justify-center sm:w-auto"
            onClick={() => {
              if (locationId === "") return;

              setReservationInitialState({
                locationId,
                date,
                preferredPricingUnitCode: "HOURLY",
              });
              setReservationOpen(true);
            }}
          >
            New reservation
          </Button>
        }
      />

      {/* FILTERS — date takes the full row on phones, location + type share one */}
      <Card className="border border-[#dadce0] shadow-none">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          <div className="col-span-2 md:col-span-1">
            <Input
              label="Selected date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          <Select
            label="Location"
            value={locationId === "" ? "" : String(locationId)}
            onChange={(event) => {
              const value = event.target.value;
              setLocationId(value === "" ? "" : Number(value));
            }}
            disabled={Boolean(locationScope)}
            options={[
              ...(!locationScope ? [{ value: "", label: "All locations" }] : []),
              ...(locations ?? []).map((location) => ({
                value: String(location.id),
                label: `${location.name} (${location.code})`,
              })),
            ]}
          />

          <Select
            label="Room type"
            value={roomTypeId === "" ? "" : String(roomTypeId)}
            onChange={(event) => {
              const value = event.target.value;
              setRoomTypeId(value === "" ? "" : Number(value));
            }}
            options={[
              { value: "", label: "All room types" },
              ...(roomTypes ?? [])
                .filter((roomType) => roomType.status === "ACTIVE")
                .map((roomType) => ({
                  value: String(roomType.id),
                  label: `${roomType.name} (${roomType.capacity} people)`,
                })),
            ]}
          />
        </div>

        {locationId === "" && (
          <p className="mt-3 text-xs text-[#5f6368] md:hidden">
            Tap an open time slot to book it, or pick a location to use New
            reservation.
          </p>
        )}
      </Card>

      {/* DATE STRIP — scrolls sideways, bleeding to the screen edge on phones */}
      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <DateStrip value={date} onChange={setDate} days={34} />
      </div>

      {/* LEGEND / COUNT / REFRESH */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
          <Legend color="#1e8e3e" label="Available" />
          <Legend color="#d93025" label="Reserved" />
          <Legend color="#f9ab00" label="Blocked" />
          <Legend color="#80868b" label="Closed" />
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          {data && (
            <p className="text-sm text-[#5f6368]">
              {data.rooms.length} {data.rooms.length === 1 ? "room" : "rooms"}
            </p>
          )}

          <Button
            variant="secondary"
            loading={isFetching}
            leftIcon={<RefreshCw size={16} />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {isError && (
        <EmptyState
          title="Unable to load availability"
          description="Something went wrong while loading room availability."
          action={
            <Button variant="secondary" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      )}

      {!isLoading && !isError && data && data.rooms.length === 0 && (
        <EmptyState
          title="No rooms found"
          description="There are no active rooms matching the selected filters."
        />
      )}

      {/* PHONE: room cards with tappable slots */}
      {hasRooms && (
        <div className="md:hidden">
          <AvailabilityMobileList
            date={date}
            rooms={data.rooms}
            hourlyPrices={hourlyPrices}
            onSelectSlot={handleSlotSelect}
          />
        </div>
      )}

      {/* TABLET / DESKTOP: timeline grid (double-click a cell) */}
      {hasRooms && timeline && (
        <div className="hidden md:block">
          <AvailabilityGrid
            date={date}
            rooms={data.rooms}
            timeline={timeline}
            onSlotDoubleClick={handleSlotSelect}
            hourlyPrices={hourlyPrices}
          />
        </div>
      )}

      {reservationOpen && (
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

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="truncate text-xs text-[#5f6368]">{label}</span>
    </div>
  );
}