import { useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { CalendarCheck, Clock3, DoorOpen } from "../../../../components/ui/MaterialIcon.tsx";

import { DateTime } from "luxon";

import { Modal, Button, Input, Select } from "../../../../components/ui/index.ts";

import { useLocations } from "../../../locations/hooks/useLocations.ts";

import { useRoomTypes } from "../../../room-types/hooks/useRoomTypes.ts";

import { roomPriceApi } from "../../../pricing/api/roomPriceApi.ts";

import { useRooms } from "../../../rooms/hooks/useRooms.ts";

import { useOperatingHours } from "../../../locations/hooks/useOperatingHours.ts";

import { useCreateReservation } from "../../../reservations/hooks/useCreateReservation.ts";

import {
  combineLocalDateAndTime,
  validateReservationTime,
} from "../../../../lib/dateTime.ts";

import type {
  ReservationAmenityRequest,
  ReservationResponse,
} from "../../../reservations/types/reservation.ts";

import {
  ContactInformationForm,
  type ContactFormValues,
} from "../../../reservations/components/ContactInformationForm";


import { PricingSelector } from "../../../reservations/components/PricingSelector";
import { ReservationAmenitySelector } from "../../../reservations/components/ReservationAmenitySelector";

import { useCalculatePrice } from "../../../pricing/hooks/useCalculatePrice.ts";
import { useAmenities } from "../../../amenities/hooks/useAmenities.ts";


export interface ReservationCreateInitialState {
  locationId?: number;

  roomId?: number;

  roomTypeId?: number;

  date?: string;

  endDate?: string;

  startTime?: string;

  endTime?: string;

  preferredPricingUnitCode?: "HOURLY" | "DAILY";
}

interface Props {
  open: boolean;

  onClose: () => void;

  initialState?: ReservationCreateInitialState;

  onCreated?: (reservation: ReservationResponse) => void;
}


const asHour = (value?: string | null): string => {
  return value?.slice(0, 5) ?? "";
};

const timeOptions = (open: string, close: string) => {
  const result: string[] = [];

  const [h, m] = open.split(":").map(Number);

  const [eh, em] = close.split(":").map(Number);

  let minutes = h * 60 + m;

  const end = eh * 60 + em;

  while (minutes < end) {
    result.push(
      `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
        minutes % 60,
      ).padStart(2, "0")}`,
    );

    minutes += 60;
  }

  return result;
};

const getDayOfWeek = (date: string) => {
  return DateTime.fromISO(date).weekday;
};

/*
 * A small numbered section wrapper. The reservation form really is a
 * sequence (room → type → schedule → amenities → contact), so a step
 * number is informative here rather than decorative.
 */
function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
          {step}
        </span>

        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>

          {description && (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>

      <div className="pl-9">{children}</div>
    </section>
  );
}

export function OwnerReservationCreateDialog({
  open,
  onClose,
  initialState,
  onCreated,
}: Props) {


  const priceCalculation = useCalculatePrice();

  const { data: locations = [] } = useLocations();

  const { data: roomTypes = [] } = useRoomTypes();


  const [locationId, setLocationId] = useState("");

  const [roomTypeId, setRoomTypeId] = useState("");

  const [roomId, setRoomId] = useState("");



  const today = DateTime.now().toISODate()!;

  const [date, setDate] = useState(today);

  const [endDate, setEndDate] = useState(today);

  const [startTime, setStartTime] = useState("");

  const [endTime, setEndTime] = useState("");

  const [pricingUnitId, setPricingUnitId] = useState<number | null>(null);

  const [reservationAmenities, setReservationAmenities] = useState<
    ReservationAmenityRequest[]
  >([]);

  const [purpose, setPurpose] = useState<ContactFormValues>({
    purpose: "",
    contactName: "",
    contactPhone: "",
    companyName: "",
    notes: "",
  });


  const previousOpenRef = useRef(false);


  const roomsQuery = useRooms({
    locationId: locationId ? Number(locationId) : undefined,

    roomTypeId: roomTypeId ? Number(roomTypeId) : undefined,

    status: "ACTIVE",

    page: 0,

    size: 100,

    sort: "roomNumber,asc",
  });

  const selectedRoom = roomsQuery.data?.content.find(
    (room) => room.id === Number(roomId),
  );

  const noRoomsAvailable =
    !!locationId &&
    !roomsQuery.isLoading &&
    (roomsQuery.data?.content.length ?? 0) === 0;


  const selectedLocation = locations.find(
    (location: any) => location.id === Number(locationId),
  );

  const timezone = selectedLocation?.timeZone ?? "Asia/Phnom_Penh";


  const { data: hours = [] } = useOperatingHours(
    locationId ? Number(locationId) : 0,
  );


  const amenitiesQuery = useAmenities({
    locationId: locationId ? Number(locationId) : undefined,
    status: "ACTIVE",
    page: 0,
    size: 100,
    sort: "name,asc",
  });

  const availableAmenities = useMemo(
    () =>
      (amenitiesQuery.data?.content ?? []).filter(
        (amenity) =>
          amenity.status === "ACTIVE" &&
          amenity.stockQuantity > 0,
      ),
    [amenitiesQuery.data],
  );



  const selectedHours = useMemo(
    () =>
      hours.find(
        (hour: any) => hour.dayOfWeek === getDayOfWeek(date) && !hour.closed,
      ),
    [hours, date],
  );

  const dailyStartHours = useMemo(
    () =>
      hours.find(
        (hour: any) => hour.dayOfWeek === getDayOfWeek(date) && !hour.closed,
      ),
    [hours, date],
  );

  const dailyEndHours = useMemo(
    () =>
      hours.find(
        (hour: any) => hour.dayOfWeek === getDayOfWeek(endDate) && !hour.closed,
      ),
    [hours, endDate],
  );


  const slots = useMemo(
    () =>
      selectedHours?.openTime && selectedHours?.closeTime
        ? timeOptions(selectedHours.openTime, selectedHours.closeTime)
        : [],
    [selectedHours],
  );


  const prices = useQuery({
    queryKey: ["reservation-room-price", selectedRoom?.id, date],

    queryFn: () =>
      roomPriceApi.search({
        roomId: selectedRoom!.id,

        status: "ACTIVE",

        effectiveDate: date,

        page: 0,

        size: 20,
      }),

    enabled: !!selectedRoom,

    staleTime: 60_000,
  });

  const availablePrices = useMemo(
    () =>
      (prices.data?.content ?? []).filter(
        (price: any) =>
          price.pricingUnitCode === "HOURLY" ||
          price.pricingUnitCode === "DAILY",
      ),
    [prices.data],
  );

  const selectedPricing = availablePrices.find(
    (price: any) => price.pricingUnitId === pricingUnitId,
  );

  const isHourly = selectedPricing?.pricingUnitCode === "HOURLY";

  const isDaily = selectedPricing?.pricingUnitCode === "DAILY";


  useEffect(() => {
    if (!open) {
      return;
    }

    if (!selectedRoom) {
      return;
    }

    if (prices.isLoading) {
      return;
    }

    if (availablePrices.length === 0) {
      setPricingUnitId(null);

      return;
    }

    const currentStillExists =
      pricingUnitId !== null &&
      availablePrices.some(
        (price: any) => price.pricingUnitId === pricingUnitId,
      );

    if (currentStillExists) {
      return;
    }

    const preferredPrice = initialState?.preferredPricingUnitCode
      ? availablePrices.find(
          (price: any) =>
            price.pricingUnitCode === initialState.preferredPricingUnitCode,
        )
      : undefined;

    const hourlyPrice = availablePrices.find(
      (price: any) => price.pricingUnitCode === "HOURLY",
    );

    const dailyPrice = availablePrices.find(
      (price: any) => price.pricingUnitCode === "DAILY",
    );

    const defaultPrice =
      preferredPrice ?? hourlyPrice ?? dailyPrice ?? availablePrices[0];

    setPricingUnitId(defaultPrice?.pricingUnitId ?? null);
  }, [
    open,
    selectedRoom?.id,
    prices.isLoading,
    availablePrices,
    pricingUnitId,
    initialState?.preferredPricingUnitCode,
  ]);

  const create = useCreateReservation();


  useEffect(() => {
    const justOpened = open && !previousOpenRef.current;

    previousOpenRef.current = open;

    if (!justOpened) {
      return;
    }

    const initialStartDate = initialState?.date ?? today;

    const initialEndDate = initialState?.endDate ?? initialStartDate;

    setLocationId(
      initialState?.locationId ? String(initialState.locationId) : "",
    );



    setRoomTypeId(
      initialState?.roomTypeId ? String(initialState.roomTypeId) : "",
    );


    setRoomId(initialState?.roomId ? String(initialState.roomId) : "");



    setDate(initialStartDate);
    setEndDate(
      initialEndDate < initialStartDate ? initialStartDate : initialEndDate,
    );


    setStartTime(initialState?.startTime ? asHour(initialState.startTime) : "");

    setEndTime(initialState?.endTime ? asHour(initialState.endTime) : "");

    setPricingUnitId(null);
    setReservationAmenities([]);

    setPurpose({
      purpose: "",
      contactName: "",
      contactPhone: "",
      companyName: "",
      notes: "",
    });

    priceCalculation.reset();
  }, [open, initialState]);


  useEffect(() => {
    if (!roomId) {
      return;
    }

    if (startTime && !slots.includes(startTime)) {
      setStartTime("");
    }

    if (endTime && !slots.includes(endTime)) {
      setEndTime("");
    }
  }, [roomId, date, selectedHours, slots, startTime, endTime]);


  const hourlyValid =
    !!date &&
    !!startTime &&
    !!endTime &&
    !!selectedHours &&
    Number(startTime.replace(":", "")) < Number(endTime.replace(":", ""));

  const dailyValid =
    !!date &&
    !!endDate &&
    !!dailyStartHours &&
    !!dailyEndHours &&
    endDate >= date;

  const canSubmit =
    !!selectedRoom &&
    !!locationId &&
    !!selectedPricing &&
    !!purpose.purpose.trim() &&
    !!purpose.contactName.trim() &&
    (isHourly ? hourlyValid : isDaily ? dailyValid : false);

  const blockingReason = (() => {
    if (!locationId) return "Choose a location to get started.";
    if (!selectedRoom) return "Select a room.";
    if (!selectedPricing) return "Choose an hourly or daily rate.";
    if (isHourly && startTime && endTime && !hourlyValid) {
      return "End time must be after start time.";
    }
    if (isHourly && !hourlyValid) return "Choose a start and end time.";
    if (isDaily && !dailyValid) return "Choose valid start and end dates.";
    if (!purpose.purpose.trim()) return "Add a purpose for the reservation.";
    if (!purpose.contactName.trim()) return "Add a contact name.";
    if (priceCalculation.isError) {
      return "Resolve the pricing error above before continuing.";
    }
    return null;
  })();

  const buildReservationPeriod = () => {
    if (!selectedRoom || !selectedPricing) {
      return null;
    }

    let startAt: string;

    let endAt: string;


    if (isHourly) {
      const error = validateReservationTime(
        date,
        startTime,
        date,
        endTime,
        timezone,
      );

      if (error) {
        return null;
      }

      startAt = combineLocalDateAndTime(date, startTime, timezone);

      endAt = combineLocalDateAndTime(date, endTime, timezone);
    } else if (isDaily) {
      if (!dailyStartHours || !dailyEndHours) {
        return null;
      }

      const dailyStartTime = asHour(dailyStartHours.openTime);

      const dailyEndTime = asHour(dailyEndHours.closeTime);


      if (endDate < date) {
        return null;
      }


      startAt = combineLocalDateAndTime(date, dailyStartTime, timezone);

      endAt = combineLocalDateAndTime(endDate, dailyEndTime, timezone);
    } else {
      return null;
    }

    return {
      startAt,
      endAt,
    };
  };


  useEffect(() => {
    if (!open) {
      priceCalculation.reset();

      return;
    }

    if (!selectedRoom) {
      priceCalculation.reset();

      return;
    }

    if (!selectedPricing) {
      priceCalculation.reset();

      return;
    }

    const period = buildReservationPeriod();

    if (!period) {
      priceCalculation.reset();

      return;
    }

    priceCalculation.mutate({
      roomId: selectedRoom.id,

      pricingUnitId: selectedPricing.pricingUnitId,

      startAt: period.startAt,

      endAt: period.endAt,
    });
  }, [
    open,
    selectedRoom?.id,
    selectedPricing?.pricingUnitId,
    date,
    endDate,
    startTime,
    endTime,
    timezone,
    dailyStartHours?.openTime,
    dailyEndHours?.closeTime,
  ]);

  const submit = async () => {
    if (!selectedRoom || !selectedPricing) {
      return;
    }

    const period = buildReservationPeriod();

    if (!period) {
      return;
    }


    const created = await create.mutateAsync({
      roomId: selectedRoom.id,

      pricingUnitId: selectedPricing.pricingUnitId,

      startAt: period.startAt,

      endAt: period.endAt,

      purpose: purpose.purpose.trim(),

      contactName: purpose.contactName.trim(),

      contactPhone: purpose.contactPhone.trim() || undefined,

      companyName: purpose.companyName.trim() || undefined,

      notes: purpose.notes.trim() || undefined,

      amenities: reservationAmenities,
    });

    onCreated?.(created);

    onClose();
  };


  const resetSelection = () => {
    setLocationId("");
    setRoomTypeId("");
    setRoomId("");
    setDate(today);
    setEndDate(today);
    setStartTime("");
    setEndTime("");
    setPricingUnitId(null);
    setReservationAmenities([]);
    priceCalculation.reset();
  };


  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New reservation"
      description="Choose the room and reservation type. The form will handle the reservation period automatically."
      size="xl"
    >
      <div className="space-y-8 scrollbar-custom">
        <FormSection
          step={1}
          title="Room"
          description="Filter by location and room type, then pick a room."
        >
          <div className="grid gap-4 md:grid-cols-3">

            <Select
              id="reservation-location"
              label="Location"
              requiredMark
              value={locationId}
              onChange={(event) => {
                setLocationId(event.target.value);

                setRoomId("");
                setReservationAmenities([]);

                priceCalculation.reset();
              }}
              options={[
                {
                  value: "",
                  label: "Select location",
                },

                ...locations
                  .filter((location: any) => location.status === "ACTIVE")
                  .map((location: any) => ({
                    value: String(location.id),

                    label: `${location.name} · ${location.code}`,
                  })),
              ]}
            />


            <Select
              id="reservation-type"
              label="Room type"
              value={roomTypeId}
              disabled={!locationId}
              onChange={(event) => {
                setRoomTypeId(event.target.value);

                setRoomId("");

                priceCalculation.reset();
              }}
              options={[
                {
                  value: "",
                  label: "All room types",
                },

                ...roomTypes
                  .filter((type: any) => type.status === "ACTIVE")
                  .map((type: any) => ({
                    value: String(type.id),

                    label: `${type.name} · ${type.capacity} seats`,
                  })),
              ]}
            />

            <Select
              id="reservation-room"
              label="Room"
              requiredMark
              value={roomId}
              onChange={(event) => {
                setRoomId(event.target.value);

                priceCalculation.reset();
              }}
              disabled={!locationId || roomsQuery.isLoading}
              options={[
                {
                  value: "",
                  label: !locationId
                    ? "Select a location first"
                    : roomsQuery.isLoading
                      ? "Loading rooms…"
                      : "Select room",
                },

                ...(roomsQuery.data?.content ?? []).map((room) => ({
                  value: String(room.id),

                  label: `${room.roomNumber} · ${room.name}`,
                })),
              ]}
            />
          </div>

          {noRoomsAvailable && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              No active rooms match this location
              {roomTypeId ? " and room type" : ""}. Try a different room type,
              or check the room's status in Room management.
            </p>
          )}

        </FormSection>
        {selectedRoom && availablePrices.length > 0 && (
          <FormSection
            step={2}
            title="Reservation type"
            description="Choose whether the room is reserved by hour or by day."
          >
            <PricingSelector
              prices={availablePrices}
              selectedPricingUnitId={pricingUnitId}
              onSelect={(id) => {
                setPricingUnitId(id);

                priceCalculation.reset();
              }}
            />
          </FormSection>
        )}

        {selectedRoom && !prices.isLoading && availablePrices.length === 0 && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            This room has no active hourly or daily rate. Add one in Pricing
            before it can be reserved.
          </p>
        )}

        {(isHourly || isDaily) && (
          <FormSection
            step={3}
            title="Schedule"
            description={
              isHourly
                ? "Pick the date and time window for this booking."
                : "Pick the first and last day of this booking."
            }
          >
            {/* HOURLY */}

            {isHourly && (
              <div className="grid gap-4 md:grid-cols-3">
                {/* DATE */}

                <Input
                  label="Date"
                  type="date"
                  requiredMark
                  min={today}
                  value={date}
                  onChange={(event) => {
                    const value = event.target.value;


                    setDate(value);

                    setEndDate(value);

                    setStartTime("");

                    setEndTime("");

                    priceCalculation.reset();
                  }}
                />

                {/* START TIME */}

                <Select
                  label="Start time"
                  value={startTime}
                  disabled={!selectedHours}
                  onChange={(event) => {
                    setStartTime(event.target.value);

                    priceCalculation.reset();
                  }}
                  options={[
                    {
                      value: "",
                      label: selectedHours ? "Choose start" : "Select a room/date",
                    },

                    ...slots.map((value) => ({
                      value,
                      label: value,
                    })),
                  ]}
                />
                <Select
                  label="End time"
                  value={endTime}
                  disabled={!startTime}
                  onChange={(event) => {
                    setEndTime(event.target.value);

                    priceCalculation.reset();
                  }}
                  options={[
                    {
                      value: "",
                      label: "Choose end",
                    },

                    ...slots
                      .filter((value) => !startTime || value > startTime)
                      .map((value) => ({
                        value,
                        label: value,
                      })),
                  ]}
                />
              </div>
            )}

            {isDaily && (
              <div className="grid gap-4 md:grid-cols-2">

                <Input
                  label="Start date"
                  type="date"
                  requiredMark
                  min={today}
                  value={date}
                  onChange={(event) => {
                    const newStartDate = event.target.value;

                    setDate(newStartDate);


                    if (!endDate || endDate < newStartDate) {
                      setEndDate(newStartDate);
                    }

                    priceCalculation.reset();
                  }}
                />

                <Input
                  label="End date"
                  type="date"
                  requiredMark
                  value={endDate}
                  min={date}
                  onChange={(event) => {
                    setEndDate(event.target.value);

                    priceCalculation.reset();
                  }}
                />
              </div>
            )}

            <div className="mt-3 space-y-2">
              {/* HOURLY */}

              {isHourly &&
                (!selectedHours ? (
                  <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    The selected location is closed on this date.
                  </p>
                ) : (
                  <>
                    <p className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock3 size={14} />
                      Booking window: {selectedHours.openTime}
                      {" — "}
                      {selectedHours.closeTime}
                    </p>

                    {startTime && endTime && !hourlyValid && (
                      <p className="text-xs font-medium text-rose-600">
                        End time must be after start time.
                      </p>
                    )}
                  </>
                ))}

              {/* DAILY */}

              {isDaily && (
                <>
                  {!dailyStartHours && (
                    <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      The location is closed on the selected start date.
                    </p>
                  )}

                  {!dailyEndHours && (
                    <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      The location is closed on the selected end date.
                    </p>
                  )}
                </>
              )}
            </div>
          </FormSection>
        )}

        {locationId && (
          <FormSection
            step={4}
            title="Amenities"
            description="Optional extras to include with this reservation."
          >
            <ReservationAmenitySelector
              amenities={availableAmenities}
              values={reservationAmenities}
              loading={amenitiesQuery.isLoading}
              onChange={setReservationAmenities}
            />
          </FormSection>
        )}
        <FormSection
          step={5}
          title="Contact details"
          description="Who this reservation is for, and how to reach them."
        >
          <ContactInformationForm values={purpose} onChange={setPurpose} />
        </FormSection>
        <div className="sticky bottom-0 -mx-6 border-t border-slate-100 bg-white/95 px-6 pt-4 backdrop-blur">
          {/* PRICE LOADING */}

          {priceCalculation.isPending && (
            <div className="mb-3 rounded-xl border border-[#dadce0] bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-500">Calculating price…</p>
            </div>
          )}

          {priceCalculation.isError && (
            <div className="mb-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3">
              <p className="text-sm text-rose-700">
                Unable to calculate the reservation price. Try adjusting the
                schedule, or try again.
              </p>
            </div>
          )}

          {priceCalculation.data && (
            <div className="mb-3 rounded-xl border border-[#dadce0] bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">
                  Total
                </span>

                <span className="text-lg font-bold text-slate-900">
                  {priceCalculation.data.totalAmount.toFixed(2)}{" "}
                  {priceCalculation.data.currencyCode}
                </span>
              </div>
            </div>
          )}

          {/* CREATE ERROR */}

          {create.isError && (
            <p className="mb-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              The room could not be reserved. It may have been booked by
              another staff member — pick a different time or room.
            </p>
          )}

          {/* FOOTER */}

          <div className="flex items-center justify-between gap-2 pb-4">
            <button
              type="button"
              onClick={resetSelection}
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Clear selection
            </button>

            <div className="flex items-center gap-3">
              {blockingReason && (
                <span className="text-xs text-slate-500">
                  {blockingReason}
                </span>
              )}

              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>

              <Button
                disabled={
                  !canSubmit ||
                  priceCalculation.isPending ||
                  priceCalculation.isError
                }
                loading={create.isPending}
                leftIcon={<CalendarCheck size={17} />}
                onClick={() => void submit()}
              >
                Create reservation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}