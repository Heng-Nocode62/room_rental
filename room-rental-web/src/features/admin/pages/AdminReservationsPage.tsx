import { useState } from "react";
import { CalendarCheck } from "../../../components/ui/MaterialIcon.tsx";
import {
  Button,
  EmptyState,
  LoadingState,
  PageHeader,
  Pagination,
} from "../../../components/ui/index.ts";
import { AdminReservationCreateDialog } from "../components/reservations/AdminReservationCreateDialog.tsx";
import { ReservationFilters } from "../../reservations/components/ReservationFilters";
import { ReservationTable } from "../../reservations/components/ReservationTable";
import { useReservations } from "../../reservations/hooks/useReservations.ts";
import { useReservationStatusMutation } from "../../reservations/hooks/useReservationStatusMutation.ts";
import type { ReservationResponse } from "../../reservations/types/reservation.ts";
import { useTranslation } from "react-i18next";
import { ReservationDetailsDialog } from "../../reservations/components/ReservationDetailsDialog";

export default function ReservationsPage() {
  const { t } = useTranslation();
  const [createOpen, setCreateOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [page, setPage] = useState(0);
  const [view, setView] = useState<ReservationResponse | null>(null);

  const [roomId, setRoomId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [pricingUnitId, setPricingUnitId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const list = useReservations({
    keyword: keyword.trim() || undefined,
    status: status || undefined,
    roomId: roomId ? Number(roomId) : undefined,
    locationId: locationId ? Number(locationId) : undefined,
    pricingUnitId: pricingUnitId ? Number(pricingUnitId) : undefined,
    date: date || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page,
    size: 20,
    sort: "startAt,desc",
  });

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
      setView((current) => (current?.id === updated.id ? updated : current));
    });
  };

  const clearFilters = () => {
    setKeyword("");
    setStatus("");
    setLocationId("");
    setRoomId("");
    setPricingUnitId("");
    setDate("");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <PageHeader
        icon={<CalendarCheck size={19} />}
        title={t("reservations")}
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
        keyword={keyword}
        status={status}
        date={date}
        locationId={locationId}
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
        onLocationIdChange={(value) => {
          setLocationId(value);
          setRoomId("");
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
        onDateChange={(value) => {
          setDate(value);
          if (value) {
            setFromDate("");
            setToDate("");
          }
          setPage(0);
        }}
        onFromDateChange={(value) => {
          setFromDate(value);
          if (value) setDate("");
          setPage(0);
        }}
        onToDateChange={(value) => {
          setToDate(value);
          if (value) setDate("");
          setPage(0);
        }}
        onClearFilters={clearFilters}
      />

      {list.isLoading && <LoadingState />}

      {list.isError && (
        <EmptyState
          title="Unable to load reservations"
          description="Something went wrong while loading reservations."
          action={
            <Button variant="secondary" onClick={() => void list.refetch()}>
              Try again
            </Button>
          }
        />
      )}

      {!list.isLoading && !list.isError && list.data?.empty && (
        <EmptyState
          title="No reservations found"
          description="Change the filters or create a new reservation."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      )}

      {!list.isLoading && !list.isError && list.data && !list.data.empty && (
        <>
          <ReservationTable
            reservations={list.data.content}
            onView={setView}
            onAction={onAction}
          />
          <Pagination pagination={list.data} onPageChange={setPage} />
        </>
      )}

      <AdminReservationCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
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
