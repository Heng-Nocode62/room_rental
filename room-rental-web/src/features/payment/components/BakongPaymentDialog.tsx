import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, RefreshCw } from "../../../components/ui/MaterialIcon.tsx";
import { QRCodeCanvas } from "qrcode.react";
import { Button, Modal } from "../../../components/ui";
import type {
  PaymentInitiateResponse,
  PaymentStatusResponse,
} from "../types/payment";
import { usePaymentStatus } from "../hooks/usePaymentStatus";
import { useCancelPayment } from "../hooks/useCancelPayment";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

interface Props {
  open: boolean;
  payment: PaymentInitiateResponse | PaymentStatusResponse | null;
  onClose: () => void;
  onSucceeded?: (payment: PaymentStatusResponse) => void;
  onCancelled?: (payment: PaymentStatusResponse) => void;
}

const terminalFailureStatuses = new Set(["FAILED", "CANCELLED", "EXPIRED"]);

/** Ticks every second while `active`, so the countdown and expiry stay live. */
function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active]);

  return now;
}

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function BakongPaymentDialog({
  open,
  payment,
  onClose,
  onSucceeded,
  onCancelled,
}: Props) {
  const paymentId = payment?.paymentId;
  const statusQuery = usePaymentStatus(paymentId);
  const cancelMutation = useCancelPayment();
  const [successHandled, setSuccessHandled] = useState(false);
  const [cancelHandled, setCancelHandled] = useState(false);

  const current = useMemo(() => {
    if (!payment) return statusQuery.data ?? null;

    return {
      ...payment,
      ...(statusQuery.data ?? {}),
    } as PaymentInitiateResponse | PaymentStatusResponse;
  }, [payment, statusQuery.data]);

  const now = useNow(open && current?.status === "PENDING");
  const expiresAt = current?.expiresAt ? new Date(current.expiresAt) : null;
  const remainingMs = expiresAt ? expiresAt.getTime() - now : null;
  const expired = remainingMs !== null && remainingMs <= 0;
  const lowTime = remainingMs !== null && remainingMs > 0 && remainingMs < 60_000;

  useEffect(() => {
    setSuccessHandled(false);
    setCancelHandled(false);
  }, [paymentId]);

  useEffect(() => {
    if (
      !open ||
      !current ||
      successHandled ||
      current.status !== "SUCCESS" ||
      !("createdAt" in current)
    ) {
      return;
    }

    setSuccessHandled(true);
    onSucceeded?.(current);
  }, [current, open, onSucceeded, successHandled]);

  const handleClose = async () => {
    if (!current) {
      onClose();
      return;
    }

    if (
      current.status === "PENDING" &&
      !cancelMutation.isPending &&
      !cancelHandled
    ) {
      setCancelHandled(true);

      try {
        const cancelled = await cancelMutation.mutateAsync(current.paymentId);
        onCancelled?.(cancelled);
      } finally {
        onClose();
      }

      return;
    }

    onClose();
  };

  if (!current) return null;

  const terminalFailure = terminalFailureStatuses.has(current.status);
  const deeplink = current.khqrDeeplink ?? current.checkoutUrl ?? null;
  const canPay = current.status === "PENDING";
  const khqr = "khqrString" in current ? current.khqrString : null;

  return (
    <Modal
      open={open}
      onClose={() => void handleClose()}
      title="Bakong payment"
      description={`Payment #${current.paymentId}`}
      size="lg"
    >
      <div className="space-y-4 sm:space-y-5">
        {/* Amount + status */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Amount to pay</p>
            <p className="truncate text-2xl font-semibold tabular-nums text-slate-900 sm:text-xl">
              {current.amount.toFixed(2)}{" "}
              <span className="text-base font-medium text-slate-500">
                {current.currency}
              </span>
            </p>
          </div>

          <div className="shrink-0">
            <PaymentStatusBadge status={current.status} />
          </div>
        </div>

        {current.status === "SUCCESS" ? (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-8 text-center sm:p-6"
          >
            <CheckCircle2 className="mx-auto text-emerald-600" size={44} />
            <p className="mt-3 text-lg font-semibold text-emerald-800">
              Payment successful
            </p>
            <p className="mt-1 text-sm text-emerald-700">
              Your payment is confirmed. You can close this window.
            </p>
          </div>
        ) : terminalFailure || expired ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-center sm:text-left"
          >
            <p className="font-semibold text-rose-800">
              Payment {expired && canPay ? "expired" : current.status.toLowerCase()}
            </p>
            <p className="mt-1 text-sm text-rose-700">
              {"errorMessage" in current && current.errorMessage
                ? current.errorMessage
                : "Close this window and start a new payment to try again."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-[240px_minmax(0,1fr)] md:items-center md:gap-8">
            {/* KHQR card */}
            <div className="mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between bg-[#E1232E] px-4 py-2 text-white">
                <span className="text-sm font-semibold tracking-wide">KHQR</span>
                <span className="text-xs text-white/80">Bakong</span>
              </div>

              <div className="flex items-center justify-center p-3">
                {khqr ? (
                  <QRCodeCanvas
                    value={khqr}
                    size={256}
                    includeMargin
                    style={{ width: "100%", height: "auto", maxWidth: 232 }}
                  />
                ) : (
                  <div className="flex aspect-square w-full max-w-[232px] items-center justify-center text-center text-sm text-slate-500">
                    QR code is not available yet.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center md:text-left">
                <p className="font-semibold text-slate-900">
                  <span className="md:hidden">Pay with your banking app</span>
                  <span className="hidden md:inline">Scan with Bakong</span>
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  <span className="md:hidden">
                    Tap the button below, or screenshot the QR code and scan it
                    from your gallery. Keep this window open.
                  </span>
                  <span className="hidden md:inline">
                    Open your banking app and scan the code. Keep this window
                    open — the status updates automatically.
                  </span>
                </p>
              </div>

              {/* Phones can't scan their own screen, so the deeplink leads here */}
              {deeplink && (
                <a
                  href={deeplink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#E1232E] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c91d28] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1232E] md:hidden"
                >
                  Open banking app <ExternalLink size={16} />
                </a>
              )}

              {/* Live status + countdown */}
              <div
                role="status"
                aria-live="polite"
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500"
              >
                <span className="flex items-center gap-2">
                  <RefreshCw
                    size={14}
                    className={statusQuery.isFetching ? "animate-spin" : ""}
                  />
                  {statusQuery.isFetching
                    ? "Checking payment status…"
                    : "Waiting for payment…"}
                </span>

                {remainingMs !== null && (
                  <span
                    className={
                      lowTime
                        ? "font-semibold tabular-nums text-rose-600"
                        : "tabular-nums text-slate-600"
                    }
                  >
                    Expires in {formatRemaining(remainingMs)}
                  </span>
                )}
              </div>

              <p className="text-center text-xs leading-5 text-slate-400 md:text-left">
                Closing this window while payment is pending cancels the payment
                and your reservation.
              </p>
            </div>
          </div>
        )}

        {statusQuery.isError && current.status !== "SUCCESS" && (
          <div
            role="alert"
            className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm font-medium text-amber-800">
              We couldn't refresh the payment status.
            </p>

            <button
              type="button"
              className="min-h-10 self-start rounded-lg px-1 text-sm font-medium text-amber-900 underline sm:self-auto"
              onClick={() => void statusQuery.refetch()}
            >
              Check again
            </button>
          </div>
        )}

        {/* Full-width on phones, right-aligned on larger screens */}
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
          <Button
            variant="secondary"
            loading={cancelMutation.isPending}
            disabled={cancelMutation.isPending}
            onClick={() => void handleClose()}
          >
            {current.status === "PENDING" ? "Cancel payment" : "Close"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}