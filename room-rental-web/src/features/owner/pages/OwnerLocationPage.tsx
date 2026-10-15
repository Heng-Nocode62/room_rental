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
  const q = useLocation(id);
  const update = useUpdateLocation();
  if (scope.isLoading || q.isLoading) return <LoadingState />;
  if (q.isError || !q.data)
    return (
      <EmptyState
        title="Unable to load location"
        description="The current location could not be loaded."
        action={<Button onClick={() => void q.refetch()}>Retry</Button>}
      />
    );
  const loc = q.data;
  const save = async (v: OwnerLocationFormValues) => {
    await update.mutateAsync({
      id: loc.id,
      request: {
        name: v.name.trim(),
        address: v.address.trim() || undefined,
        phone: v.phone.trim() || undefined,
        timeZone: v.timeZone,
        floor: loc.floor,
      },
    });
    setEdit(false);
  };
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <PageHeader
        icon={<MapPin size={19} />}
        title="Location"
        description="Manage the current shop location."
      />
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <LocationStatusBadge status={loc.status} />
            <p className="mt-3 text-xl font-semibold text-slate-900">
              {loc.name}
            </p>
            <p className="mt-1 text-sm text-slate-500">{loc.code}</p>
          </div>
          <Button variant="secondary" onClick={() => setEdit(true)}>
            Edit
          </Button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Info label="Address" value={loc.address || "—"} />
          <Info label="Phone" value={loc.phone || "—"} />
          <Info label="Time zone" value={loc.timeZone} />
          <Info label="Rooms" value={String(loc.totalRooms)} />
        </div>
      </Card>
      <Card>
        <LocationOperatingHours locationId={loc.id} />
      </Card>
      <Modal open={edit} onClose={() => setEdit(false)} title="Edit location">
        <OwnerLocationForm
          mode="edit"
          initialValues={loc}
          onSubmit={save}
          loading={update.isPending}
        />
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
