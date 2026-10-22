import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import * as QRCode from "qrcode";

import type {
  ReservationQrResponse,
} from "../types/reservationQr";

import {
  Button,
  Card,
  Icon,
  Modal,
} from "../../../features/user/components/UserUI";

interface PaymentQrDialogProps {
  open: boolean;
  onClose: () => void;

  data: ReservationQrResponse | null;

  loading: boolean;
  error: string | null;

  onRetry: () => void;
}

function getTelegramUrl(
  contact?: string | null,
): string | null {
  const value = contact?.trim();

  if (!value) {
    return null;
  }

  // Accept a full Telegram link.
  if (
    /^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\//i.test(
      value,
    )
  ) {
    const normalized = /^https?:\/\//i.test(value)
      ? value
      : `https://${value}`;

    try {
      const url = new URL(normalized);
      const host = url.hostname.toLowerCase();

      if (
        host !== "t.me" &&
        host !== "www.t.me" &&
        host !== "telegram.me" &&
        host !== "www.telegram.me"
      ) {
        return null;
      }

      return url.toString();
    } catch {
      return null;
    }
  }

  // Otherwise, accept a Telegram username such as @roomowner.
  const username = value.replace(/^@/, "");

  if (!/^[a-zA-Z0-9_]{5,32}$/.test(username)) {
    return null;
  }

  return `https://t.me/${encodeURIComponent(username)}`;
}

export function PaymentQrDialog({
  open,
  onClose,
  data,
  loading,
  error,
  onRetry,
}: PaymentQrDialogProps) {
  const [qrImage, setQrImage] =
    useState<string | null>(null);

  const [qrError, setQrError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setQrImage(null);
    setQrError(null);

    if (!open || !data?.qrString) {
      return () => {
        cancelled = true;
      };
    }

    QRCode.toDataURL(data.qrString, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 300,
    })
      .then((image) => {
        if (!cancelled) {
          setQrImage(image);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrError(
            "Unable to display the QR code. Please retry.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, data?.qrString]);

  const telegramUrl = getTelegramUrl(
    data?.telegramContact,
  );

  const expiresAt = data?.expiresAt
    ? DateTime.fromISO(data.expiresAt).toLocal()
    : null;

  const openTelegram = () => {
    if (!telegramUrl) {
      return;
    }

    // Called directly from the user's click so browsers allow navigation.
    window.open(
      telegramUrl,
      "_blank",
      "noopener,noreferrer",
    );

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reservation created"
      description={
        data
          ? `${data.reservationReference} · ${data.locationName}`
          : "Generate a Bakong KHQR for your reservation."
      }
      size="lg"
    >
      {loading ? (
        <div className="flex flex-col items-center py-12 text-center">
          <span className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
            Generating your KHQR...
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Your reservation is already created. Please wait.
          </p>
        </div>
      ) : error ? (
        <div className="space-y-4">
          <div
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
          >
            <p className="font-semibold">
              Could not generate the QR code
            </p>

            <p className="mt-1 break-words">
              {error}
            </p>

            <p className="mt-2 text-xs">
              Your reservation was created. Retry QR
              generation; do not reserve the room again.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Close
            </Button>

            <Button onClick={onRetry}>
              Retry QR generation
            </Button>
          </div>
        </div>
      ) : data ? (
        <div className="space-y-5">
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Amount to pay
            </p>

            <p className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">
              {data.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {data.currency}
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Reservation reference: {data.reservationReference}
            </p>
          </Card>

          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900">
            {qrImage ? (
              <img
                src={qrImage}
                alt="Bakong KHQR for reservation payment"
                className="h-[280px] w-[280px] max-w-full rounded-xl bg-white object-contain p-2"
              />
            ) : (
              <div className="flex h-[280px] w-[280px] max-w-full items-center justify-center text-center text-sm text-slate-500 dark:text-slate-400">
                {qrError ?? "Preparing QR code..."}
              </div>
            )}

            {qrError && (
              <p
                role="alert"
                className="mt-2 text-sm text-rose-600"
              >
                {qrError}
              </p>
            )}

            <p className="mt-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
              Scan using Bakong or a supported banking app
            </p>

            <p className="mt-1 max-w-sm text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
              After you pay, click Done to open Telegram and
              send your payment receipt to the location owner.
            </p>

            {expiresAt?.isValid && (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                QR expires at{" "}
                {expiresAt.toFormat("dd MMM yyyy, hh:mm a")}
              </p>
            )}

            {data.deeplink && (
              <a
                href={data.deeplink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Open Bakong payment link
              </a>
            )}
          </div>

          {!telegramUrl && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
              This location does not have a valid Telegram
              contact configured. Please contact the location
              owner directly.
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Close
            </Button>

            <Button
              onClick={openTelegram}
              disabled={!telegramUrl || !qrImage}
              leftIcon={<Icon name="check" size={16} />}
            >
              Done — open Telegram
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            No QR response was received.
          </p>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Close
            </Button>

            <Button onClick={onRetry}>
              Retry
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}