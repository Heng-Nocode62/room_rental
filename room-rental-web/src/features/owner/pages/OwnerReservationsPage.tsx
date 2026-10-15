import { useEffect, useState } from "react";

import { CalendarCheck } from "../../../components/ui/MaterialIcon.tsx";
import {
  Button,
  EmptyState,
  LoadingState,
  PageHeader,
  Pagination,
} from "../../../components/ui";

import { useLocationScope } from "../../location-scope/LocationScopeProvider";
import { useReservations } from "../../reservations/hooks/useReservations";
import { useReservationStatusMutation } from "../../reservations/hooks/useReservationStatusMutation";

import type { ReservationResponse } from "../../reservations/types/reservation";

import { ReservationFilters } from "../../reservations/components/ReservationFilters";
import { ReservationTable } from "../../reservations/components/ReservationTable";
import { ReservationDetailsDialog } from "../../reservations/components/ReservationDetailsDialog";
import { OwnerReservationCreateDialog } from "../components/reservations/OwnerReservationCreateDialog";

export default function OwnerReservationsPage() {
  const scope = useLocationScope();

  const [createOpen, setCreateOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [roomId, setRoomId] = useState("");
  const [pricingUnitId, setPricingUnitId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);
  const [view, setView] = useState<ReservationResponse | null>(null);

  const locationId = scope.currentLocationId;

  // Reset the room and pagination when the active location changes.
  useEffect(() => {
    setRoomId("");
    setPage(0);
  }, [locationId]);

  const canLoadReservations =
    !scope.isLoading &&
    !scope.isError &&
    locationId !== null;

  const list = useReservations(
    {
      keyword: keyword.trim() || undefined,
      status: status || undefined,

      // Owner reservations are always scoped to the active location.
      locationId: locationId ?? undefined,

      roomId: roomId ? Number(roomId) : undefined,
      pricingUnitId: pricingUnitId
        ? Number(pricingUnitId)
        : undefined,

      date: date || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,

      page,
      size: 20,
      sort: "startAt,desc",
    },
    canLoadReservations,
  );

  const confirm = useReservationStatusMutation("confirm");
  const cancel = useReservationStatusMutation("cancel");
  const checkIn = useReservationStatusMutation("checkIn");
  const checkOut = useReservationStatusMutation("checkOut");

  const onAction = (
    action: "confirm" | "cancel" | "checkIn" | "checkOut",
    reservation: ReservationResponse,
  ) => {
    const mutation = { confirm, cancel, checkIn, checkOut }[action];

    void mutation.mutateAsync(reservation.id).then((updated) => {
      setView((current) =>
        current?.id === updated.id ? updated : current,
      );
    });
  };

  const clearFilters = () => {
    setKeyword("");
    setStatus("");
    setRoomId("");
    setPricingUnitId("");
    setDate("");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  const handleDateChange = (value: string) => {
    setDate(value);

    if (value) {
      setFromDate("");
      setToDate("");
    }

    setPage(0);
  };

  const handleFromDateChange = (value: string) => {
    setFromDate(value);

    if (value) {
      setDate("");
    }

    setPage(0);
  };

  const handleToDateChange = (value: string) => {
    setToDate(value);

    if (value) {
      setDate("");
    }

    setPage(0);
  };

  if (scope.isLoading) {
    return <LoadingState />;
  }

  if (scope.isError) {
    return (
      <EmptyState
        title="Unable to load your location"
        description="Your assigned locations could not be loaded. Please refresh the page and try again."
      />
    );
  }

  if (locationId === null) {
    return (
      <EmptyState
        title="No location selected"
        description="You need an assigned location before you can view and manage reservations."
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <PageHeader
        icon={<CalendarCheck size={19} />}
        title="Reservations"
        actions={
          <Button
            onClick={() => setCreateOpen(true)}
            leftIcon={<CalendarCheck size={17} />}
          >
            New reservation
          </Button>
        }
      />

      <ReservationFilters
        showResourceFilters
        fixedLocationId={locationId}
        keyword={keyword}
        status={status}
        date={date}
        roomId={roomId}
        pricingUnitId={pricingUnitId}
        fromDate={fromDate}
        toDate={toDate}
        onKeywordChange={(value) => {
          setKeyword(value);
          setPage(0);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(0);
        }}
        onRoomIdChange={(value) => {
          setRoomId(value);
          setPage(0);
        }}
        onPricingUnitIdChange={(value) => {
          setPricingUnitId(value);
          setPage(0);
        }}
        onDateChange={handleDateChange}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
        onClearFilters={clearFilters}
      />

      {list.isLoading && <LoadingState />}

      {list.isError && (
        <EmptyState
          title="Unable to load reservations"
          description="Something went wrong while loading reservations."
          action={
            <Button
              variant="secondary"
              onClick={() => void list.refetch()}
            >
              Try again
            </Button>
          }
        />
      )}

      {!list.isLoading &&
        !list.isError &&
        list.data?.empty && (
          <EmptyState
            title="No reservations found"
            description="Change the filters or create a new reservation."
            action={
              <Button
                variant="secondary"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            }
          />
        )}

      {!list.isLoading &&
        !list.isError &&
        list.data &&
        !list.data.empty && (
          <>
            <ReservationTable
              reservations={list.data.content}
              onView={setView}
              onAction={onAction}
            />

            <Pagination
              pagination={list.data}
              onPageChange={setPage}
            />
          </>
        )}

      <OwnerReservationCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initialState={{ locationId }}
        onCreated={setView}
      />

      <ReservationDetailsDialog
        reservation={view}
        onClose={() => setView(null)}
        onAction={onAction}
        loadingAction={
          confirm.isPending
            ? "confirm"
            : cancel.isPending
              ? "cancel"
              : checkIn.isPending
                ? "checkIn"
                : checkOut.isPending
                  ? "checkOut"
                  : null
        }
        showWorkflowActions
      />
    </div>
  );
}