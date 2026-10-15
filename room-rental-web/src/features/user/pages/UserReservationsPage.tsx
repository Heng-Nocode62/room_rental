import { useMemo, useState } from "react";

import { useReservationStatusMutation } from "../../reservations/hooks/useReservationStatusMutation";
import type { ReservationResponse } from "../../reservations/types/reservation";

import {
  Button,
  Card,
  Empty,
  Input,
  Modal,
  PageLoading,
  SectionTitle,
} from "../components/UserUI";
import { ReservationDetailsDialog } from "../components/ReservationDetailsDialog";
import { useMyReservations } from "../hooks/useMyReservation";
import { ReservationCard } from "./ReservationCard";

/* ─── Tab definition ─────────────────────────────────────── */
type StatusTab = "UPCOMING" | "PAST" | "CANCELLED" | "ALL";

const TABS: { value: StatusTab; label: string }[] = [
  { value: "UPCOMING", label: "Upcoming" },
  { value: "PAST", label: "Past" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "ALL", label: "All" },
];

/* ─── Page ───────────────────────────────────────────────── */
export default function UserReservationsPage() {
  const reservations = useMyReservations();

  const cancel = useReservationStatusMutation("cancel");

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<StatusTab>("UPCOMING");
  const [date, setDate] = useState("");

  const [selected, setSelected] =
    useState<ReservationResponse | null>(null);

  const [cancelTarget, setCancelTarget] =
    useState<ReservationResponse | null>(null);

  /* ── Keep filter logic exactly ──────────────────────────── */
  const filtered = useMemo(() => {
    const now = Date.now();

    return (reservations.data ?? []).filter((reservation) => {
      const matchesKeyword =
        !keyword.trim() ||
        reservation.referenceNo
          .toLowerCase()
          .includes(keyword.trim().toLowerCase()) ||
        reservation.roomName
          .toLowerCase()
          .includes(keyword.trim().toLowerCase()) ||
        reservation.purpose
          .toLowerCase()
          .includes(keyword.trim().toLowerCase());

      const timestamp = new Date(reservation.startAt).getTime();

      const matchesStatus =
        status === "ALL"
          ? true
          : status === "UPCOMING"
            ? reservation.status !== "CANCELLED" && timestamp >= now
            : status === "PAST"
              ? timestamp < now && reservation.status !== "CANCELLED"
              : reservation.status === "CANCELLED";

      const matchesDate =
        !date || reservation.startAt.startsWith(date);

      return matchesKeyword && matchesStatus && matchesDate;
    });
  }, [reservations.data, keyword, status, date]);

  /* ── Keep confirmCancel logic exactly ───────────────────── */
  const confirmCancel = async () => {
    if (!cancelTarget) return;
    await cancel.mutateAsync(cancelTarget.id);
    await reservations.refetch();
    setCancelTarget(null);
    setSelected(null);
  };

  if (reservations.isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-5 lg:px-8">
      {/* ── Header ─────────────────────────────────────────── */}
      <SectionTitle
        eyebrow="Your activity"
        title="My Reservations"
        description="Keep track of upcoming bookings and view your full reservation history."
      />

      {/* ── Tabs + Filters ─────────────────────────────────── */}
      <Card className="overflow-hidden">
        {/* Tab strip */}
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
          {TABS.map((tab) => {
            const active = status === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatus(tab.value)}
                className={[
                  "relative shrink-0 px-6 py-4 text-sm font-semibold transition",
                  active
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200",
                ].join(" ")}
              >
                {tab.label}
                {active && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Search + date row */}
        <div className="grid gap-3 p-4 sm:grid-cols-[1fr_200px]">
          <Input
            placeholder="Search by room, reference no. or purpose…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </Card>

      {/* ── Results ────────────────────────────────────────── */}
      {reservations.isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-16 text-center dark:border-rose-500/20 dark:bg-rose-500/5">
          <p className="text-base font-semibold text-rose-700 dark:text-rose-400">
            Unable to load reservations
          </p>
          <p className="mt-1 text-sm text-rose-500 dark:text-rose-400/70">
            Please refresh and try again.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <Empty
          title="No reservations found"
          description="There are no reservations matching the current filters."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onView={() => setSelected(reservation)}
              onCancel={() => setCancelTarget(reservation)}
            />
          ))}
        </div>
      )}

      {/* ── Detail Dialog ──────────────────────────────────── */}
      <ReservationDetailsDialog
        reservation={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onCancel={() => setCancelTarget(selected)}
        loading={cancel.isPending}
      />

      {/* ── Cancel Confirmation Modal ──────────────────────── */}
      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel reservation"
        description="This action will cancel the selected reservation."
      >
        {cancelTarget && (
          <div className="space-y-5">
            {/* Warning banner */}
            <div className="flex gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/20 dark:bg-rose-500/10">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-500/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-rose-600 dark:text-rose-400"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>

              <div>
                <p className="font-semibold text-rose-700 dark:text-rose-300">
                  Cancel{" "}
                  <span className="font-black">
                    {cancelTarget.referenceNo}
                  </span>
                  ?
                </p>
                <p className="mt-0.5 text-sm text-rose-600 dark:text-rose-400">
                  {cancelTarget.roomName}
                </p>
                <p className="mt-2 text-xs text-rose-500 dark:text-rose-400/70">
                  This action cannot be undone. The reservation will be
                  permanently cancelled.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                variant="secondary"
                onClick={() => setCancelTarget(null)}
              >
                Keep reservation
              </Button>

              <Button
                variant="danger"
                loading={cancel.isPending}
                onClick={() => void confirmCancel()}
              >
                Yes, cancel it
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}