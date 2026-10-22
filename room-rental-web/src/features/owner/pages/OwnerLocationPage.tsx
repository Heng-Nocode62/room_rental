import { useState } from "react";

import {
  Button,
  Card,
  EmptyState,
  LoadingState,
  Modal,
  PageHeader,
} from "../../../components/ui";

import { MapPin } from "../../../components/ui/MaterialIcon.tsx";

import { useLocation } from "../../locations/hooks/useLocation";
import { useUpdateLocation } from "../../locations/hooks/useUpdateLocation";
import { useUpdateLocationImage } from "../../locations/hooks/useUpdateLocationImage";
import { useLocationScope } from "../../location-scope/LocationScopeProvider";

import {
  OwnerLocationForm,
  type OwnerLocationFormValues,
} from "../components/locations/OwnerLocationForm";

import { LocationStatusBadge } from "../../locations/components/LocationStatusBadge";
import { LocationOperatingHours } from "../../locations/components/LocationOperatingHours";

export default function OwnerLocationPage() {
  const scope = useLocationScope();
  const id = scope.currentLocationId ?? 0;

  const [edit, setEdit] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const q = useLocation(id);
  const update = useUpdateLocation();
  const updateImage = useUpdateLocationImage();

  if (scope.isLoading || q.isLoading) {
    return <LoadingState />;
  }

  if (q.isError || !q.data) {
    return (
      <EmptyState
        title="Unable to load location"
        description="The current location could not be loaded."
        action={
          <Button onClick={() => void q.refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  const loc = q.data;

  const save = async (v: OwnerLocationFormValues) => {
    setFormError(null);

    try {
      await update.mutateAsync({
        id: loc.id,
        request: {
          name: v.name.trim(),
          address: v.address.trim() || undefined,
          phone: v.phone.trim() || undefined,
          timeZone: v.timeZone.trim(),
          floor: loc.floor,
          locationBakongAccountId:
            v.locationBakongAccountId.trim() || undefined,
          telegramContact:
            v.telegramContact.trim() || undefined,
        },
      });

      if (v.image) {
        await updateImage.mutateAsync({
          id: loc.id,
          image: v.image,
        });
      }

      setEdit(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save the location.",
      );
    }
  };

  const formLoading =
    update.isPending || updateImage.isPending;

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">

      <Card>
        {loc.imageUrl && (
          <img
            src={loc.imageUrl}
            alt={`${loc.name} location`}
            className="mb-5 h-56 w-full rounded-xl object-cover"
          />
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <LocationStatusBadge status={loc.status} />

            <p className="mt-3 text-xl font-semibold text-slate-900">
              {loc.name}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {loc.code}
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={() => {
              setFormError(null);
              setEdit(true);
            }}
          >
            Edit
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Info label="Address" value={loc.address || "—"} />
          <Info label="Phone" value={loc.phone || "—"} />
          <Info label="Time zone" value={loc.timeZone} />
          <Info label="Rooms" value={String(loc.totalRooms)} />

          <Info
            label="Bakong account ID"
            value={loc.locationBakongAccountId || "Not configured"}
          />

          <Info
            label="Telegram contact"
            value={loc.telegramContact || "Not configured"}
          />
        </div>
      </Card>

      <Card>
        <LocationOperatingHours locationId={loc.id} />
      </Card>

      <Modal
        open={edit}
        onClose={() => {
          setEdit(false);
          setFormError(null);
        }}
        title="Edit location"
      >
        <OwnerLocationForm
          mode="edit"
          initialValues={loc}
          onSubmit={save}
          loading={formLoading}
          error={formError}
        />
      </Modal>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}