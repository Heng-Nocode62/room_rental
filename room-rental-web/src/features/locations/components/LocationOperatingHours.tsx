import { useMemo, useState } from "react";

import {
  Button,
  Card,
  Input,
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
  locationId: number;
}

type Draft = {
  openTime: string;
  closeTime: string;
  closed: boolean;
};

function toTime(value?: string | null) {
  return value ? value.slice(0, 5) : "";
}

export function LocationOperatingHours({ locationId }: Props) {
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
        (operatingHours ?? []).map((item) => [item.dayOfWeek, item])
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

    if (!confirmed) return;

    await deleteMutation.mutateAsync({
      locationId,
      dayOfWeek,
    });

    if (editingDay === dayOfWeek) {
      cancelEdit();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <LoadingState />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Operating hours
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Unable to load the location schedule.
            </p>
          </div>

          <Button variant="secondary" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Operating hours
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Define when rooms at this location can be reserved.
          </p>
        </div>
      </div>

      <div className="mt-6 divide-y divide-slate-200">
        {DAYS_OF_WEEK.map((day) => {
          const existing = hoursByDay.get(day.value);
          const isEditing = editingDay === day.value;

          return (
            <div
              key={day.value}
              className="py-4 first:pt-0 last:pb-0"
            >
              {!isEditing ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {day.label}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {formatHours(existing)}
                    </p>
                  </div>

                  <div className="flex gap-2">
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
                <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">
                      {day.label}
                    </p>

                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={draft?.closed ?? false}
                        onChange={(event) =>
                          setDraft((current) =>
                            current
                              ? {
                                  ...current,
                                  closed: event.target.checked,
                                }
                              : current
                          )
                        }
                      />
                      Closed
                    </label>
                  </div>

                  {!draft?.closed && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Open time"
                        type="time"
                        value={draft?.openTime ?? ""}
                        onChange={(event) =>
                          setDraft((current) =>
                            current
                              ? {
                                  ...current,
                                  openTime: event.target.value,
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
                                  closeTime: event.target.value,
                                }
                              : current
                          )
                        }
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
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
                    <p className="text-sm text-red-600">
                      Unable to save operating hours.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
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

