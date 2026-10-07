import { useMemo, useState } from "react";
import { CalendarClock } from "../../../components/ui/MaterialIcon.tsx";

import {
  Button,
  Input,
  Modal,
  LoadingState,
} from "../../../components/ui";

import { useOperatingHours } from "../hooks/useOperatingHours";
import { useUpdateOperatingHours } from "../hooks/useUpdateOperatingHours";
import { useDeleteOperatingHours } from "../hooks/useDeleteOperatingHours";

import {
  DAYS_OF_WEEK,
  type OperatingHoursResponse,
} from "../types/operatingHours";

interface Props {
  open: boolean;
  onClose: () => void;
  locationId: number;
  locationName: string;
}

type Draft = {
  openTime: string;
  closeTime: string;
  closed: boolean;
};

function toTime(value?: string | null) {
  return value ? value.slice(0, 5) : "";
}

export function OperatingHoursDialog({
  open,
  onClose,
  locationId,
  locationName,
}: Props) {
  const {
    data: operatingHours,
    isLoading,
    isError,
    refetch,
  } = useOperatingHours(locationId);

  const updateMutation = useUpdateOperatingHours();
  const deleteMutation = useDeleteOperatingHours();

  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  const hoursByDay = useMemo(
    () =>
      new Map(
        (operatingHours ?? []).map((item) => [
          item.dayOfWeek,
          item,
        ])
      ),
    [operatingHours]
  );

  const startEdit = (dayOfWeek: number) => {
    const existing = hoursByDay.get(dayOfWeek);

    setEditingDay(dayOfWeek);

    setDraft({
      openTime: toTime(existing?.openTime),
      closeTime: toTime(existing?.closeTime),
      closed: existing?.closed ?? false,
    });
  };

  const cancelEdit = () => {
    setEditingDay(null);
    setDraft(null);
  };

  const save = async (dayOfWeek: number) => {
    if (!draft) return;

    if (
      !draft.closed &&
      (!draft.openTime ||
        !draft.closeTime ||
        draft.openTime >= draft.closeTime)
    ) {
      window.alert("Open time must be before close time.");
      return;
    }

    await updateMutation.mutateAsync({
      locationId,
      dayOfWeek,
      request: {
        dayOfWeek,
        closed: draft.closed,
        openTime: draft.closed ? null : draft.openTime,
        closeTime: draft.closed ? null : draft.closeTime,
      },
    });

    cancelEdit();
  };

  const resetDay = async (dayOfWeek: number) => {
    const confirmed = window.confirm(
      "Remove this operating-hours configuration?"
    );

    if (!confirmed) {
      return;
    }

    await deleteMutation.mutateAsync({
      locationId,
      dayOfWeek,
    });

    if (editingDay === dayOfWeek) {
      cancelEdit();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Operating hours"
      description={`${locationName} · Configure when rooms can be reserved.`}
      size="lg"
    >
      <div className="space-y-5">
        {/* Location header */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
            <CalendarClock size={20} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              {locationName}
            </p>

            <p className="text-xs text-slate-500">
              Operating schedule
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-8">
            <LoadingState />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-center">
            <p className="text-sm font-medium text-rose-700">
              Unable to load operating hours.
            </p>

            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => refetch()}
            >
              Try again
            </Button>
          </div>
        )}

        {/* Schedule */}
        {!isLoading && !isError && (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            {DAYS_OF_WEEK.map((day) => {
              const existing = hoursByDay.get(day.value);
              const isEditing = editingDay === day.value;

              return (
                <div
                  key={day.value}
                  className="border-b border-slate-200 last:border-b-0"
                >
                  {!isEditing ? (
                    <div className="flex items-center justify-between gap-4 px-4 py-4">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">
                          {day.label}
                        </p>

                        <p
                          className={`mt-1 text-sm ${
                            !existing || existing.closed
                              ? "text-rose-500"
                              : "text-slate-500"
                          }`}
                        >
                          {formatHours(existing)}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => startEdit(day.value)}
                        >
                          Edit
                        </Button>

                        {existing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            loading={deleteMutation.isPending}
                            onClick={() => resetDay(day.value)}
                          >
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium text-slate-900">
                          {day.label}
                        </p>

                        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={draft?.closed ?? false}
                            onChange={(event) =>
                              setDraft((current) =>
                                current
                                  ? {
                                      ...current,
                                      closed:
                                        event.target.checked,
                                    }
                                  : current
                              )
                            }
                            className="h-4 w-4 rounded border-slate-300"
                          />

                          Closed
                        </label>
                      </div>

                      {!draft?.closed && (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <Input
                            label="Open time"
                            type="time"
                            value={draft?.openTime ?? ""}
                            onChange={(event) =>
                              setDraft((current) =>
                                current
                                  ? {
                                      ...current,
                                      openTime:
                                        event.target.value,
                                    }
                                  : current
                              )
                            }
                          />

                          <Input
                            label="Close time"
                            type="time"
                            value={draft?.closeTime ?? ""}
                            onChange={(event) =>
                              setDraft((current) =>
                                current
                                  ? {
                                      ...current,
                                      closeTime:
                                        event.target.value,
                                    }
                                  : current
                              )
                            }
                          />
                        </div>
                      )}

                      <div className="mt-4 flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>

                        <Button
                          size="sm"
                          loading={updateMutation.isPending}
                          onClick={() => save(day.value)}
                        >
                          Save
                        </Button>
                      </div>

                      {updateMutation.isError && (
                        <p className="mt-3 text-sm text-rose-600">
                          Unable to save operating hours.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading &&
          !isError &&
          operatingHours?.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <CalendarClock className="mx-auto mb-2 h-6 w-6 text-slate-400" />

              <p className="text-sm font-medium text-slate-700">
                No operating hours configured
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Select a day and configure its opening hours.
              </p>
            </div>
          )}
      </div>
    </Modal>
  );
}

function formatHours(hours?: OperatingHoursResponse) {
  if (!hours || hours.closed) {
    return "Closed";
  }

  if (!hours.openTime || !hours.closeTime) {
    return "Not configured";
  }

  return `${toTime(hours.openTime)} – ${toTime(hours.closeTime)}`;
}