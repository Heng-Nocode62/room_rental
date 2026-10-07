import { useState } from "react";
import { MapPin, Plus } from "../../../components/ui/MaterialIcon.tsx";
import {
  Button,
  EmptyState,
  LoadingState,
  Modal,
  PageHeader,
  QuickViewDialog,
} from "../../../components/ui/index.ts";
import { useLocations } from "../../locations/hooks/useLocations.ts";
import { useCreateLocation } from "../../locations/hooks/useCreateLocation.ts";
import { useUpdateLocation } from "../../locations/hooks/useUpdateLocation.ts";
import { useDeactivateLocation } from "../../locations/hooks/useDeactivateLocation.ts";
import {
  AdminLocationForm,
  type AdminLocationFormValues,
} from "../components/locations/AdminLocationForm.tsx";
import { LocationTable } from "../../locations/components/LocationTable";
import type { LocationResponse } from "../../locations/types/location.ts";
import { OperatingHoursDialog } from "../../locations/components/OperatingHoursDialog";
import { useTranslation } from "react-i18next";

export default function LocationsPage() {
    const {t} = useTranslation();
  const { data: locations, isLoading, isError, refetch } = useLocations();
  const create = useCreateLocation();
  const update = useUpdateLocation();
  const deactivate = useDeactivateLocation();
  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<LocationResponse | null>(null);
  const [view, setView] = useState<LocationResponse | null>(null);
  const [hours, setHours] = useState<LocationResponse | null>(null);
  const close = () => {
    setMode(null);
    setSelected(null);
  };
  const submit = async (v: AdminLocationFormValues) => {
    const req = {
      name: v.name.trim(),
      address: v.address.trim() || undefined,
      phone: v.phone.trim() || undefined,
      timeZone: v.timeZone.trim(),
    };
    if (mode === "edit" && selected)
      await update.mutateAsync({ id: selected.id, request: req });
    else
      await create.mutateAsync({ name: req.name, code: v.code.trim(), ...req });
    close();
  };
  return (
    <div className="mx-auto w-full max-w-350 space-y-6">
      <PageHeader
        icon={<MapPin size={19} />}
        title= {t("locations")}
        actions={
          <Button
            leftIcon={<Plus size={17} />}
            onClick={() => setMode("create")}
          >
            Add location
          </Button>
        }
      />
      {isLoading && <LoadingState />}
      {isError && (
        <EmptyState
          title="Unable to load locations"
          description="Something went wrong while loading locations."
          action={
            <Button variant="secondary" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      )}
      {!isLoading && !isError && !!locations?.length && (
        <LocationTable
          locations={locations}
          onView={setView}
          onEdit={(item) => {
            setSelected(item);
            setMode("edit");
          }}
          onHours={setHours}
          onToggle={(item) => {
            if (item.status === "ACTIVE") void deactivate.mutateAsync(item.id);
          }}
        />
      )}
      {!isLoading && !isError && locations?.length === 0 && (
        <EmptyState
          title="No locations yet"
          description="Create a location before adding rooms."
          action={
            <Button onClick={() => setMode("create")}>Add location</Button>
          }
        />
      )}
      <Modal
        open={mode !== null}
        onClose={close}
        title={mode === "edit" ? "Edit location" : "Add location"}
        description="Location identity stays compact; operating hours are managed separately."
      >
        <AdminLocationForm
          key={`${mode}-${selected?.id ?? "new"}`}
          mode={mode || "create"}
          initialValues={selected ?? undefined}
          onSubmit={submit}
          loading={create.isPending || update.isPending}
        />
        {(create.isError || update.isError) && (
          <p className="mt-3 text-sm text-rose-600">
            Unable to save the location.
          </p>
        )}
      </Modal>
      {view && (
        <QuickViewDialog
          open={!!view}
          onClose={() => setView(null)}
          title={view.name}
          eyebrow={`Location · ${view.code}`}
          fields={[
            { label: "Status", value: view.status },
            { label: "Timezone", value: view.timeZone },
            { label: "Phone", value: view.phone || "—" },
            { label: "Address", value: view.address || "—", wide: true },
          ]}
        />
      )}
      {hours && (
        <OperatingHoursDialog
          open={!!hours}
          onClose={() => setHours(null)}
          locationId={hours.id}
          locationName={hours.name}
        />
      )}
    </div>
  );
}
