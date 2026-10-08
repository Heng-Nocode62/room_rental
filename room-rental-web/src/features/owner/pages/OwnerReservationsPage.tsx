import { useState } from "react";
import {
  CalendarCheck,
} from "../../../components/ui/MaterialIcon.tsx";
import {
  Button,
  EmptyState,
  LoadingState,
  PageHeader,
  Pagination,
} from "../../../components/ui";
import { useReservations } from "../../reservations/hooks/useReservations";
import { useReservationStatusMutation } from "../../reservations/hooks/useReservationStatusMutation";
import type { ReservationResponse } from "../../reservations/types/reservation";
import { ReservationFilters } from "../../reservations/components/ReservationFilters";
import { ReservationTable } from "../../reservations/components/ReservationTable";
import { OwnerReservationCreateDialog } from "../components/reservations/OwnerReservationCreateDialog.tsx";
import { ReservationDetailsDialog } from "../../reservations/components/ReservationDetailsDialog";
import { useLocationScope } from "../../location-scope/LocationScopeProvider";

export default function OwnerReservationsPage() {
  const scope = useLocationScope();
  const [createOpen, setCreateOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [page, setPage] = useState(0);
  const [view, setView] = useState<ReservationResponse | null>(null);
  const list = useReservations({
    locationId: scope.currentLocationId ?? undefined,
    keyword: keyword.trim() || undefined,
    status: status || undefined,
    date: date || undefined,
    page,
    size: 20,
    sort: "startAt,desc",
  });
  const confirm = useReservationStatusMutation("confirm"),
    cancel = useReservationStatusMutation("cancel"),
    checkIn = useReservationStatusMutation("checkIn"),
    checkOut = useReservationStatusMutation("checkOut");
  const onAction = (
    action: "confirm" | "cancel" | "checkIn" | "checkOut",
    item: ReservationResponse,
  ) => {
    const mutation = { confirm, cancel, checkIn, checkOut }[action];
    void mutation
      .mutateAsync(item.id)
      .then((updated) =>
        setView((current) => (current?.id === updated.id ? updated : current)),
      );
  };
  const clear = () => {
    setKeyword("");
    setStatus("");
    setDate("");
    setPage(0);
  };
  if (scope.isLoading) return <LoadingState />;
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <PageHeader
        icon={<CalendarCheck size={19} />}
        title="Reservations"
        actions={
          <Button
            leftIcon={<CalendarCheck size={17} />}
            onClick={() => setCreateOpen(true)}
          >
            New reservation
          </Button>
        }
      />
      <ReservationFilters
        keyword={keyword}
        status={status}
        date={date}
        onKeywordChange={(v) => {
          setKeyword(v);
          setPage(0);
        }}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(0);
        }}
        onDateChange={(v) => {
          setDate(v);
          setPage(0);
        }}
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
      )}{" "}
      {!list.isLoading && !list.isError && list.data?.empty && (
        <EmptyState
          title="No reservations found"
          description="Change the filters or create a new reservation."
          action={
            <Button variant="secondary" onClick={clear}>
              Clear filters
            </Button>
          }
        />
      )}{" "}
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
      <OwnerReservationCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initialState={{ locationId: scope.currentLocationId ?? undefined }}
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
