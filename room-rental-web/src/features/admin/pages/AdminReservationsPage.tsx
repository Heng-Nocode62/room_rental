import { useState } from "react";
import { CalendarCheck, CreditCard } from "../../../components/ui/MaterialIcon.tsx";
import { DateTime } from "luxon";
import {
  Button,
  EmptyState,
  LoadingState,
  Modal,
  PageHeader,
  Pagination,
} from "../../../components/ui/index.ts";
import { AdminReservationCreateDialog } from "../components/reservations/AdminReservationCreateDialog.tsx";
import { ReservationFilters } from "../../reservations/components/ReservationFilters";
import { ReservationTable } from "../../reservations/components/ReservationTable";
import { useReservations } from "../../reservations/hooks/useReservations.ts";
import { useReservationStatusMutation } from "../../reservations/hooks/useReservationStatusMutation.ts";
import { useReservationPaymentFlow } from "../../reservations/hooks/useReservationPaymentFlow.ts";
import type { ReservationResponse } from "../../reservations/types/reservation.ts";
import { BakongPaymentDialog } from "../../payment/components/BakongPaymentDialog";
import { useTranslation } from "react-i18next";

export default function ReservationsPage() {
  const { t } = useTranslation();
  const [createOpen, setCreateOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [page, setPage] = useState(0);
  const [view, setView] = useState<ReservationResponse | null>(null);

  const list = useReservations({
    keyword: keyword.trim() || undefined,
    status: status || undefined,
    date: date || undefined,
    page,
    size: 20,
    sort: "startAt,desc",
  });

  const confirm = useReservationStatusMutation("confirm");
  const cancel = useReservationStatusMutation("cancel");
  const checkIn = useReservationStatusMutation("checkIn");
  const checkOut = useReservationStatusMutation("checkOut");
  const paymentFlow = useReservationPaymentFlow();

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
    setDate("");
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
        keyword={keyword}
        status={status}
        date={date}
        onKeywordChange={(value) => {
          setKeyword(value);
          setPage(0);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(0);
        }}
        onDateChange={(value) => {
          setDate(value);
          setPage(0);
        }}
      />

      {paymentFlow.error && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-sm text-rose-700">{paymentFlow.error}</p>
          <button
            type="button"
            className="text-xs font-medium text-rose-800 underline"
            onClick={paymentFlow.clearError}
          >
            Dismiss
          </button>
        </div>
      )}

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
            onPayment={(reservation) => {
              void paymentFlow.openPayment(reservation).catch(() => undefined);
            }}
          />
          <Pagination pagination={list.data} onPageChange={setPage} />
        </>
      )}

      <AdminReservationCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={paymentFlow.handleCreated}
      />

      <ReservationDetailsDialog
        reservation={view}
        onClose={() => setView(null)}
        onPay={(reservation) => {
          void paymentFlow.openPayment(reservation).catch(() => undefined);
        }}
        paymentLoading={paymentFlow.paymentCreating}
      />

      <BakongPaymentDialog
        open={Boolean(paymentFlow.payment)}
        payment={paymentFlow.payment}
        onClose={paymentFlow.closePayment}
        onSucceeded={(payment) => void paymentFlow.handlePaymentSucceeded(payment)}
        onCancelled={paymentFlow.handlePaymentCancelled}
      />
    </div>
  );
}

function ReservationDetailsDialog({
  reservation,
  onClose,
  onPay,
  paymentLoading,
}: {
  reservation: ReservationResponse | null;
  onClose: () => void;
  onPay: (reservation: ReservationResponse) => void;
  paymentLoading: boolean;
}) {
  if (!reservation) return null;

  const canPay = reservation.status === "PENDING";
  const zone = "Asia/Phnom_Penh";

  return (
    <Modal
      open={Boolean(reservation)}
      onClose={onClose}
      title={reservation.referenceNo}
      description={`${reservation.roomNumber} · ${reservation.status}`}
      size="lg"
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Info label="Room" value={`${reservation.roomNumber} · ${reservation.roomName}`} />
          <Info label="Contact" value={reservation.contactName} />
          <Info
            label="Schedule"
            value={`${DateTime.fromISO(reservation.startAt).setZone(zone).toFormat("dd MMM yyyy HH:mm")} → ${DateTime.fromISO(reservation.endAt).setZone(zone).toFormat("dd MMM yyyy HH:mm")}`}
          />
          <Info
            label="Amount"
            value={`${reservation.totalAmount.toFixed(2)} ${reservation.currencyCode}`}
          />
          <Info label="Pricing" value={reservation.pricingUnitCode} />
          <Info label="Reserved by" value={reservation.reservedByName} />
          <Info label="Purpose" value={reservation.purpose || "—"} />
          <Info label="Phone" value={reservation.contactPhone || "—"} />
          <Info label="Company" value={reservation.companyName || "—"} />
        </div>

        {reservation.notes && (
          <div>
            <p className="text-xs text-slate-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
              {reservation.notes}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          {canPay && (
            <Button
              leftIcon={<CreditCard size={16} />}
              loading={paymentLoading}
              onClick={() => onPay(reservation)}
            >
              Pay with Bakong
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
