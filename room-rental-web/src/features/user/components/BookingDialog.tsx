import { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useOperatingHours } from "../../locations/hooks/useOperatingHours";
import { roomPriceApi } from "../../pricing/api/roomPriceApi";
import { useCreateReservation } from "../../reservations/hooks/useCreateReservation";
import { useDayAvailability } from "../../availability/hooks/useDayAvailability";

import type { RoomResponse } from "../../rooms/types/room";
import type { RoomTypeResponse } from "../../room-types/types/roomType";
import type { LocationResponse } from "../../locations/types/location";
import type { ReservationAmenityRequest } from "../../reservations/types/reservation";

import { Button, Card, Icon, Input, Modal, SelectInput } from "./UserUI";
import { useMonthAvailability } from "../../availability/hooks/useMonthAvailability";

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;

  room: RoomResponse;
  roomType?: RoomTypeResponse;
  location?: LocationResponse;

  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;

  onCreated?: (reservationId: number) => void;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

const formatUnits = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(2);

export function BookingDialog({
  open,
  onClose,
  room,
  roomType,
  location,
  initialDate,
  initialStartTime,
  initialEndTime,
  onCreated,
}: BookingDialogProps) {
  const queryClient = useQueryClient();

  const { data: user } = useCurrentUser();

  const timezone = location?.timeZone || "Asia/Phnom_Penh";

  const today = DateTime.now().setZone(timezone).toISODate()!;

  const [pricingUnitCode, setPricingUnitCode] = useState<"HOURLY" | "DAILY">(
    "HOURLY",
  );

  const [date, setDate] = useState(initialDate || today);

  const [endDate, setEndDate] = useState(initialDate || today);

  const [startTime, setStartTime] = useState(initialStartTime || "");

  const [endTime, setEndTime] = useState(initialEndTime || "");

  const [purpose, setPurpose] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [notes, setNotes] = useState("");

  const [amenities, setAmenities] = useState<ReservationAmenityRequest[]>([]);

  const hours = useOperatingHours(room.locationId);

  const availability = useDayAvailability(room.id, date);
  const startMonth = DateTime.fromISO(date || today);
  const endMonth = DateTime.fromISO(endDate || today);
  const startMonthAvailability = useMonthAvailability(
    room.id,
    startMonth.year,
    startMonth.month,
  );
  const endMonthAvailability = useMonthAvailability(
    room.id,
    endMonth.year,
    endMonth.month,
  );

  const prices = useQuery({
    queryKey: ["user-room-price", room.id, date],

    queryFn: () =>
      roomPriceApi.search({
        roomId: room.id,
        status: "ACTIVE",
        effectiveDate: date,
        page: 0,
        size: 20,
      }),

    enabled: open,

    staleTime: 60_000,
  });

  // Daily booking is only offered when the whole start day is free:
  // every slot AVAILABLE and none already in the past.
  const dayIsFullyFree = useMemo(() => {
    const slots = availability.data?.slots ?? [];
    if (slots.length === 0) return false;
    const now = DateTime.now();
    return slots.every(
      (slot) =>
        slot.status === "AVAILABLE" &&
        DateTime.fromISO(`${date}T${slot.start.slice(0, 5)}`, {
          zone: timezone,
        }) > now,
    );
  }, [availability.data, date, timezone]);
  const rangeFullyFree = useMemo(() => {
    if (pricingUnitCode !== "DAILY") return true;

    const statusByDate = new Map(
      [
        ...(startMonthAvailability.data?.days ?? []),
        ...(endMonthAvailability.data?.days ?? []),
      ].map((day) => [day.date, day.status]),
    );

    let day = DateTime.fromISO(date);
    const last = DateTime.fromISO(endDate);
    if (!day.isValid || !last.isValid) return false;

    for (; day <= last; day = day.plus({ days: 1 })) {
      const status = statusByDate.get(day.toISODate()!);
      // Days in months we haven't loaded are left for the backend to validate.
      if (status && status !== "AVAILABLE") return false;
    }
    return true;
  }, [
    pricingUnitCode,
    date,
    endDate,
    startMonthAvailability.data,
    endMonthAvailability.data,
  ]);

  const create = useCreateReservation();

  useEffect(() => {
    if (!open) return;

    setDate(initialDate || today);
    setEndDate(initialDate || today);

    setStartTime(initialStartTime || "");
    setEndTime(initialEndTime || "");

    setContactName(`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim());

    setContactPhone(user?.phone ?? "");

    setPurpose("");
    setCompanyName("");
    setNotes("");
    setAmenities([]);
  }, [open, initialDate, initialStartTime, initialEndTime, user?.id]);

  const availablePrices = useMemo(
    () =>
      (prices.data?.content ?? []).filter(
        (price) =>
          price.pricingUnitCode === "HOURLY" ||
          (price.pricingUnitCode === "DAILY" && dayIsFullyFree),
      ),
    [prices.data, dayIsFullyFree],
  );

  const selectedPrice = availablePrices.find(
    (price) => price.pricingUnitCode === pricingUnitCode,
  );

  const daySlots = useMemo(() => {
    const now = DateTime.now();
    return (availability.data?.slots ?? []).filter(
      (slot) =>
        slot.status === "AVAILABLE" &&
        DateTime.fromISO(`${date}T${slot.start.slice(0, 5)}`, {
          zone: timezone,
        }) > now,
    );
  }, [availability.data, date, timezone]);

  const startOptions = useMemo(
    () => [...new Set(daySlots.map((slot) => slot.start.slice(0, 5)))],
    [daySlots],
  );

  const endOptions = useMemo(() => {
    if (!startTime) return [];

    const startIndex = daySlots.findIndex(
      (slot) => slot.start.slice(0, 5) === startTime,
    );

    if (startIndex < 0) return [];

    const values: string[] = [];

    for (let i = startIndex; i < daySlots.length; i++) {
      values.push(daySlots[i].end.slice(0, 5));
    }

    return [...new Set(values)];
  }, [daySlots, startTime]);

  const startHours = useMemo(
    () =>
      (hours.data ?? []).find(
        (item) =>
          item.dayOfWeek === DateTime.fromISO(date).weekday && !item.closed,
      ),
    [hours.data, date],
  );

  const endHours = useMemo(
    () =>
      (hours.data ?? []).find(
        (item) =>
          item.dayOfWeek === DateTime.fromISO(endDate).weekday && !item.closed,
      ),
    [hours.data, endDate],
  );

  /**
   * Frontend price preview (display only — nothing here is sent to the backend).
   *  - HOURLY: hourly price × hours between start and end time
   *  - DAILY:  daily price × number of days (start and end date inclusive)
   *  - Extras: amenity price × selected quantity
   * The backend still validates and decides the real total when the reservation is created.
   */
  const pricePreview = useMemo(() => {
    if (!selectedPrice) return null;

    let units: number;
    let unitLabel: string;

    if (selectedPrice.pricingUnitCode === "HOURLY") {
      if (!startTime || !endTime) return null;

      const start = DateTime.fromISO(`${date}T${startTime}`, { zone: timezone });
      const end = DateTime.fromISO(`${date}T${endTime}`, { zone: timezone });
      if (!start.isValid || !end.isValid) return null;

      units = end.diff(start, "hours").hours;
      if (units <= 0) return null;
      unitLabel = units === 1 ? "hour" : "hours";
    } else {
      const start = DateTime.fromISO(date);
      const end = DateTime.fromISO(endDate);
      if (!start.isValid || !end.isValid || endDate < date) return null;

      units = Math.round(end.diff(start, "days").days) + 1;
      unitLabel = units === 1 ? "day" : "days";
    }

    const roomAmount = round2(selectedPrice.price * units);

    const extras = amenities
      .map((selected) => {
        const amenity = room.amenities.find(
          (item) => item.amenityId === selected.amenityId,
        );
        if (!amenity || selected.quantity <= 0) return null;
        return {
          id: amenity.amenityId,
          name: amenity.name,
          quantity: selected.quantity,
          unitPrice: amenity.price,
          amount: round2(amenity.price * selected.quantity),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const extrasTotal = round2(
      extras.reduce((sum, item) => sum + item.amount, 0),
    );

    return {
      unitPrice: selectedPrice.price,
      units,
      unitLabel,
      roomAmount,
      extras,
      total: round2(roomAmount + extrasTotal),
      currency: selectedPrice.currencyCode,
    };
  }, [
    selectedPrice,
    date,
    endDate,
    startTime,
    endTime,
    timezone,
    amenities,
    room.amenities,
  ]);

  // The reservation must start in the future. Hourly uses the chosen start
  // time; daily starts at the opening time of the first day.
  const startsInFuture = useMemo(() => {
    const startClock =
      pricingUnitCode === "DAILY"
        ? startHours?.openTime?.slice(0, 5)
        : startTime;
    if (!date || !startClock) return false;
    return (
      DateTime.fromISO(`${date}T${startClock}`, { zone: timezone }) >
      DateTime.now()
    );
  }, [pricingUnitCode, date, startTime, startHours?.openTime, timezone]);

  const canSubmit =
    !!selectedPrice &&
    !!purpose.trim() &&
    !!contactName.trim() &&
    (pricingUnitCode === "DAILY"
      ? !!date &&
        !!endDate &&
        endDate >= date &&
        !!startHours &&
        !!endHours &&
        rangeFullyFree
      : !!date && !!startTime && !!endTime && endTime > startTime) &&
    startsInFuture;

  const addAmenity = (amenityId: number, quantity: number) => {
    setAmenities((current) => {
      const existing = current.find((item) => item.amenityId === amenityId);

      if (quantity <= 0) {
        return current.filter((item) => item.amenityId !== amenityId);
      }

      if (existing) {
        return current.map((item) =>
          item.amenityId === amenityId ? { ...item, quantity } : item,
        );
      }

      return [
        ...current,
        {
          amenityId,
          quantity,
        },
      ];
    });
  };

  const submit = async () => {
    if (!selectedPrice) return;

    let startAt: string;
    let endAt: string;

    if (selectedPrice.pricingUnitCode === "HOURLY") {
      if (!startTime || !endTime) return;

      startAt = DateTime.fromISO(`${date}T${startTime}`, { zone: timezone })
        .toUTC()
        .toISO()!;

      endAt = DateTime.fromISO(`${date}T${endTime}`, { zone: timezone })
        .toUTC()
        .toISO()!;
    } else {
      if (!startHours?.openTime || !endHours?.closeTime) {
        return;
      }

      startAt = DateTime.fromISO(`${date}T${startHours.openTime.slice(0, 5)}`, {
        zone: timezone,
      })
        .toUTC()
        .toISO()!;

      endAt = DateTime.fromISO(`${endDate}T${endHours.closeTime.slice(0, 5)}`, {
        zone: timezone,
      })
        .toUTC()
        .toISO()!;
    }

    const created = await create.mutateAsync({
      roomId: room.id,
      pricingUnitId: selectedPrice.pricingUnitId,
      startAt,
      endAt,
      purpose: purpose.trim(),
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim() || undefined,
      companyName: companyName.trim() || undefined,
      notes: notes.trim() || undefined,
      amenities,
    });

    await queryClient.invalidateQueries({
      queryKey: ["user-reservations"],
    });

    onCreated?.(created.id);
    onClose();
  };
  useEffect(() => {
    if (pricingUnitCode === "DAILY" && availability.data && !dayIsFullyFree) {
      setPricingUnitCode("HOURLY");
      setStartTime("");
      setEndTime("");
    }
  }, [pricingUnitCode, availability.data, dayIsFullyFree]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reserve this room"
      description={`${room.name} · ${room.roomNumber}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* ROOM SUMMARY */}

        <Card className="overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            <div className="h-40 w-full sm:w-48">
              {room.imageUrl || roomType?.imageUrl ? (
                <img
                  src={room.imageUrl || roomType?.imageUrl || ""}
                  alt={room.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full">
                  <div className="h-full w-full bg-slate-100 dark:bg-slate-800" />
                </div>
              )}
            </div>

            <div className="flex-1 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                {location?.name ?? room.locationName}
              </p>

              <h3 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                {room.name}
              </h3>

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>{room.roomNumber}</span>

                <span>{room.capacity} people</span>

                <span>Floor {room.floor ?? "—"}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* PRICING */}

        <div>
          <p className="mb-3 text-sm font-bold text-slate-950 dark:text-white">
            Reservation type
          </p>

          <div className="grid grid-cols-2 gap-3">
            {availablePrices.map((price) => {
              const active = pricingUnitCode === price.pricingUnitCode;

              return (
                <button
                  type="button"
                  key={price.pricingUnitId}
                  onClick={() => {
                    setPricingUnitCode(
                      price.pricingUnitCode as "HOURLY" | "DAILY",
                    );

                    setStartTime("");
                    setEndTime("");
                  }}
                  className={
                    active
                      ? "rounded-2xl border-2 border-blue-500 bg-blue-50 p-4 text-left dark:bg-blue-500/10"
                      : "rounded-2xl border border-slate-200 bg-white p-4 text-left dark:border-slate-700 dark:bg-slate-900"
                  }
                >
                  <p className="font-bold text-slate-900 dark:text-white">
                    {price.pricingUnitName}
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {price.price.toFixed(2)} {price.currencyCode}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* SCHEDULE */}

        {pricingUnitCode === "HOURLY" ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Date"
              type="date"
              min={today}
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setStartTime("");
                setEndTime("");
              }}
            />

            <SelectInput
              label="Start time"
              value={startTime}
              onChange={(event) => {
                setStartTime(event.target.value);
                setEndTime("");
              }}
            >
              <option value="">Select start</option>

              {startOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </SelectInput>

            <SelectInput
              label="End time"
              value={endTime}
              disabled={!startTime}
              onChange={(event) => setEndTime(event.target.value)}
            >
              <option value="">Select end</option>

              {endOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </SelectInput>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Start date"
              type="date"
              min={today}
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />

            <Input
              label="End date"
              type="date"
              min={date}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        )}

        {/* CONTACT */}

        <div className="space-y-4">
          <p className="text-sm font-bold text-slate-950 dark:text-white">
            Reservation details
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Purpose"
              required
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              placeholder="Team meeting"
            />

            <Input
              label="Contact name"
              required
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
            />

            <Input
              label="Contact phone"
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
            />

            <Input
              label="Company"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
            />
          </div>

          <Input
            label="Notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional notes"
          />
        </div>

        {/* AMENITIES */}

        {room.amenities.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-bold text-slate-950 dark:text-white">
              Optional extras
            </p>

            <div className="space-y-2">
              {room.amenities.map((amenity) => {
                const selected =
                  amenities.find((item) => item.amenityId === amenity.amenityId)
                    ?.quantity ?? 0;

                return (
                  <div
                    key={amenity.amenityId}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 p-3 dark:border-slate-700"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {amenity.name}
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {amenity.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          addAmenity(
                            amenity.amenityId,
                            Math.max(0, selected - 1),
                          )
                        }
                        className="h-8 w-8 rounded-lg border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                      >
                        −
                      </button>

                      <span className="w-6 text-center text-sm font-semibold">
                        {selected}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          addAmenity(
                            amenity.amenityId,
                            Math.min(amenity.amount, selected + 1),
                          )
                        }
                        className="h-8 w-8 rounded-lg border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PRICE PREVIEW (calculated in the browser) */}

        {pricePreview ? (
          <Card className="border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Price preview
            </p>

            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="min-w-0 text-slate-600 dark:text-slate-300">
                  {pricePreview.unitPrice.toFixed(2)} ×{" "}
                  {formatUnits(pricePreview.units)} {pricePreview.unitLabel}
                </dt>
                <dd className="shrink-0 font-semibold text-slate-900 dark:text-white">
                  {pricePreview.roomAmount.toFixed(2)}
                </dd>
              </div>

              {pricePreview.extras.map((extra) => (
                <div
                  key={extra.id}
                  className="flex items-start justify-between gap-4"
                >
                  <dt className="min-w-0 text-slate-600 dark:text-slate-300">
                    {extra.name} × {extra.quantity}
                  </dt>
                  <dd className="shrink-0 font-semibold text-slate-900 dark:text-white">
                    {extra.amount.toFixed(2)}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-3 flex items-center justify-between gap-4 border-t border-blue-200/70 pt-3 dark:border-blue-900/50">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Estimated total
              </p>
              <p className="text-xl font-black text-slate-950 dark:text-white">
                {pricePreview.total.toFixed(2)} {pricePreview.currency}
              </p>
            </div>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              This is an estimate. The final total is confirmed when the
              reservation is created.
            </p>
          </Card>
        ) : (
          selectedPrice && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {pricingUnitCode === "HOURLY"
                ? "Select a start and end time to see the price."
                : "Select valid start and end dates to see the price."}
            </p>
          )
        )}

        {availability.data &&
          daySlots.length === 0 &&
          pricingUnitCode === "HOURLY" && (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              No available time slots remain on this date.
            </div>
          )}

        {create.isError && (
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
            The room could not be reserved. Please check the schedule and try
            again.
          </div>
        )}
        {pricingUnitCode === "DAILY" && !rangeFullyFree && (
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            Some days in this range are already booked or closed. Choose
            different dates.
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button
            disabled={!canSubmit}
            loading={create.isPending}
            leftIcon={<Icon name="calendar" size={17} />}
            onClick={() => void submit()}
          >
            Confirm reservation
          </Button>
        </div>
      </div>
    </Modal>
  );
}