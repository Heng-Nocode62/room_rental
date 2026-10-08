import { useMemo, useState } from "react";

import { useReservationStatusMutation } from "../../reservations/hooks/useReservationStatusMutation";
import type { ReservationResponse } from "../../reservations/types/reservation";

import {
  Button,
  Empty,
  Input,
  PageLoading,
  SectionTitle,
  SelectInput,
  Modal,
  Card,
} from "../components/UserUI";
;
import { ReservationDetailsDialog } from "../components/ReservationDetailsDialog";
import { useMyReservations } from "../hooks/useMyReservation";
import { ReservationCard } from "./ReservationCard";

export default function UserReservationsPage() {
  const reservations =
    useMyReservations();

  const cancel =
    useReservationStatusMutation(
      "cancel",
    );

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] =
    useState("UPCOMING");
  const [date, setDate] = useState("");

  const [selected, setSelected] =
    useState<ReservationResponse | null>(
      null,
    );

  const [cancelTarget, setCancelTarget] =
    useState<ReservationResponse | null>(
      null,
    );

  const filtered =
    useMemo(() => {
      const now = Date.now();

      return (reservations.data ?? []).filter(
        (reservation) => {
          const matchesKeyword =
            !keyword.trim() ||
            reservation.referenceNo
              .toLowerCase()
              .includes(
                keyword
                  .trim()
                  .toLowerCase(),
              ) ||
            reservation.roomName
              .toLowerCase()
              .includes(
                keyword
                  .trim()
                  .toLowerCase(),
              ) ||
            reservation.purpose
              .toLowerCase()
              .includes(
                keyword
                  .trim()
                  .toLowerCase(),
              );

          const timestamp =
            new Date(
              reservation.startAt,
            ).getTime();

          const matchesStatus =
            status === "ALL"
              ? true
              : status === "UPCOMING"
                ? reservation.status !==
                    "CANCELLED" &&
                  timestamp >= now
                : status === "PAST"
                  ? timestamp < now &&
                    reservation.status !==
                      "CANCELLED"
                  : reservation.status ===
                    "CANCELLED";

          const matchesDate =
            !date ||
            reservation.startAt.startsWith(
              date,
            );

          return (
            matchesKeyword &&
            matchesStatus &&
            matchesDate
          );
        },
      );
    }, [
      reservations.data,
      keyword,
      status,
      date,
    ]);

  if (reservations.isLoading) {
    return <PageLoading />;
  }

  const confirmCancel =
    async () => {
      if (!cancelTarget) return;

      await cancel.mutateAsync(
        cancelTarget.id,
      );

      await reservations.refetch();

      setCancelTarget(null);

      setSelected(null);
    };

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 px-4 py-8 lg:px-8">
      <SectionTitle
        eyebrow="Your activity"
        title="My Reservations"
        description="Keep track of upcoming bookings and view your reservation history."
      />

      {/* FILTERS */}

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <Input
            placeholder="Search reservations..."
            value={keyword}
            onChange={(event) =>
              setKeyword(
                event.target.value,
              )
            }
          />

          <SelectInput
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value,
              )
            }
          >
            <option value="UPCOMING">
              Upcoming
            </option>

            <option value="PAST">
              Past
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>

            <option value="ALL">
              All reservations
            </option>
          </SelectInput>

          <Input
            type="date"
            value={date}
            onChange={(event) =>
              setDate(
                event.target.value,
              )
            }
          />
        </div>
      </Card>

      {/* LIST */}

      {reservations.isError ? (
        <Empty
          title="Unable to load reservations"
          description="Please refresh and try again."
        />
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
              onView={() =>
                setSelected(
                  reservation,
                )
              }
              onCancel={() =>
                setCancelTarget(
                  reservation,
                )
              }
            />
          ))}
        </div>
      )}

      {/* DETAIL */}

      <ReservationDetailsDialog
        reservation={selected}
        open={!!selected}
        onClose={() =>
          setSelected(null)
        }
        onCancel={() =>
          setCancelTarget(
            selected,
          )
        }
        loading={cancel.isPending}
      />

      {/* CANCEL CONFIRMATION */}

      <Modal
        open={!!cancelTarget}
        onClose={() =>
          setCancelTarget(null)
        }
        title="Cancel reservation"
        description="This action will cancel the selected reservation."
      >
        {cancelTarget && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-rose-50 p-4 dark:bg-rose-500/10">
              <p className="font-semibold text-rose-700 dark:text-rose-400">
                Cancel{" "}
                {cancelTarget.referenceNo}?
              </p>

              <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">
                {cancelTarget.roomName}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() =>
                  setCancelTarget(null)
                }
              >
                Keep reservation
              </Button>

              <Button
                variant="danger"
                loading={
                  cancel.isPending
                }
                onClick={() =>
                  void confirmCancel()
                }
              >
                Cancel reservation
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}