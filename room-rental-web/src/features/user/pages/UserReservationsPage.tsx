import { useState } from "react";
import { CalendarCheck } from "../../../components/ui/MaterialIcon.tsx";
import {
  Button,
  EmptyState,
  LoadingState,
  Modal,
  PageHeader,
} from "../../../components/ui";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useReservationPaymentFlow } from "../../reservations/hooks/useReservationPaymentFlow";
import { useReservationStatusMutation } from "../../reservations/hooks/useReservationStatusMutation";
import type { ReservationResponse } from "../../reservations/types/reservation";
import { ReservationFilters } from "../../reservations/components/ReservationFilters";
import { UserReservationTable } from "../components/reservations/UserReservationTable";
import { BakongPaymentDialog } from "../../payment/components/BakongPaymentDialog";
import { useMyReservation } from "../hooks/useMyReservation.ts";
import { ReservationCreateDialog } from "../../reservations/components/ReservationCreateDialog.tsx";

export default function UserReservationsPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const [createOpen, setCreateOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [view, setView] = useState<ReservationResponse | null>(null);
  const payment = useReservationPaymentFlow();
  const cancel = useReservationStatusMutation("cancel");
  // const myReservations = useMemo(
  //   () =>
  //     (list.data?.content ?? []).filter(
  //       (item) => item.reservedById === user?.id,
  //     ),
  //   [list.data, user?.id],
  // );
  const {data,loading:reservationLoading,error:reservationError,loadMyReservation}= useMyReservation();
  const myReservations  = data;
  if (userLoading || reservationLoading) return <LoadingState />;
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <PageHeader
        icon={<CalendarCheck size={19} />}
        title="My Reservations"
        description="View and manage your reservations."
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
        onKeywordChange={setKeyword}
        onStatusChange={setStatus}
        onDateChange={setDate}
      />
      {reservationError ? (
        <EmptyState
          title="Unable to load reservations"
          description="Try again."
          action={
            <Button variant="secondary" onClick={() => void loadMyReservation}>
              Try again
            </Button>
          }
        />
      ) : myReservations.length === 0 ? (
        <EmptyState
          title="No reservations found"
          description="You do not have reservations matching the current filters."
          action={
            <Button onClick={() => setCreateOpen(true)}>New reservation</Button>
          }
        />
      ) : (
        <UserReservationTable
          reservations={myReservations}
          onView={setView}
          onPayment={(item) => payment.start(item.id)}
          onCancel={(item) => {
            if (window.confirm(`Cancel ${item.referenceNo}?`))
              void cancel.mutateAsync(item.id);
          }}
        />
      )}
      {/* <UserReservationCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      /> */}
      <ReservationCreateDialog
      open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <BakongPaymentDialog
        open={payment.open}
        onClose={payment.closePayment}
        reservationId={""}
        onCompleted={() => void list.refetch()}
      />
      <Modal
        open={Boolean(view)}
        onClose={() => setView(null)}
        title={view ? view.referenceNo : "Reservation"}
      >
        {view && (
          <div className="space-y-5">
            <p className="text-sm text-slate-600">
              {view.roomNumber} · {view.roomName}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Start" value={view.startAt} />
              <Info label="End" value={view.endAt} />
              <Info
                label="Amount"
                value={`${view.totalAmount.toFixed(2)} ${view.currencyCode}`}
              />
              <Info label="Status" value={view.status} />
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setView(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
