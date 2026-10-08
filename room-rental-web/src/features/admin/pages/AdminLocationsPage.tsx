import { useState } from "react";

import {
  MapPin,
  Plus,
} from "../../../components/ui/MaterialIcon.tsx";

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

import { useRoles } from "../../roles/hooks/roleHooks.ts";
import { useUsers } from "../../users/hooks/useUsers.ts";
export default function AdminLocationsPage() {
  const { t } = useTranslation();
  const {
    data: locations,
    isLoading,
    isError,
    refetch,
  } = useLocations();

  const create = useCreateLocation();
  const update = useUpdateLocation();
  const deactivate = useDeactivateLocation();

  const roles = useRoles();

  /*
   * Find the OWNER role.
   *
   * Prefer code because it is usually the stable backend value.
   * The name fallback makes this a little more tolerant.
   */
  const ownerRole = roles.data?.find(
    (role) =>
      role.code?.toUpperCase() === "OWNER" ||
      role.name?.toUpperCase() === "OWNER",
  );

  const ownerRoleId = ownerRole?.id;

  /*
   * Get only users who have the OWNER role.
   *
   * -1 is used while roles are still loading so we do not
   * accidentally fetch every user.
   */
  const ownerUsers = useUsers({
    roleId: ownerRoleId ?? -1,
    page: 0,
    size: 100,
    sort: "username,asc",
  });

  const [mode, setMode] = useState<"create" | "edit" | null>(
    null,
  );

  const [selected, setSelected] =
    useState<LocationResponse | null>(null);

  const [view, setView] =
    useState<LocationResponse | null>(null);

  const [hours, setHours] =
    useState<LocationResponse | null>(null);

  const close = () => {
    setMode(null);
    setSelected(null);
  };

  const submit = async (
    v: AdminLocationFormValues,
  ) => {
    const common = {
      name: v.name.trim(),
      address: v.address.trim() || undefined,
      phone: v.phone.trim() || undefined,
      timeZone: v.timeZone.trim(),
      floor: v.floor,
    };

    if (mode === "edit" && selected) {
      await update.mutateAsync({
        id: selected.id,
        request: common,
      });

      close();
      return;
    }

    if (!v.ownerId) {
      return;
    }

    await create.mutateAsync({
      name: common.name,
      code: v.code.trim(),
      address: common.address,
      phone: common.phone,
      timeZone: common.timeZone,
      floor: common.floor,
      ownerId: v.ownerId,
    });

    close();
  };


  const selectedOwner = view
    ? ownerUsers.data?.content.find(
        (user) => user.id === view.ownerId,
      )
    : undefined;

  return (
    <div className="mx-auto w-full max-w-350 space-y-6">
      <PageHeader
        icon={<MapPin size={19} />}
        title={t("locations")}
        actions={
          <Button
            leftIcon={<Plus size={17} />}
            onClick={() => setMode("create")}
          >
            Add location
          </Button>
        }
      />

      {/* Loading */}

      {isLoading && <LoadingState />}

      {/* Error */}

      {isError && (
        <EmptyState
          title="Unable to load locations"
          description="Something went wrong while loading locations."
          action={
            <Button
              variant="secondary"
              onClick={() => refetch()}
            >
              Try again
            </Button>
          }
        />
      )}

      {/* Locations */}

      {!isLoading &&
        !isError &&
        !!locations?.length && (
          <LocationTable
            locations={locations}
            onView={setView}
            onEdit={(item) => {
              setSelected(item);
              setMode("edit");
            }}
            onHours={setHours}
            onToggle={(item) => {
              if (item.status === "ACTIVE") {
                void deactivate.mutateAsync(item.id);
              }
            }}
          />
        )}

      {/* Empty */}

      {!isLoading &&
        !isError &&
        locations?.length === 0 && (
          <EmptyState
            title="No locations yet"
            description="Create a location before adding rooms."
            action={
              <Button
                onClick={() => setMode("create")}
              >
                Add location
              </Button>
            }
          />
        )}

      {/* Create / Edit */}

      <Modal
        open={mode !== null}
        onClose={close}
        title={
          mode === "edit"
            ? "Edit location"
            : "Add location"
        }
        description="Location identity stays compact; operating hours are managed separately."
      >
        <AdminLocationForm
          key={`${mode}-${selected?.id ?? "new"}`}
          mode={mode || "create"}
          initialValues={
            selected ?? undefined
          }
          owners={
            ownerUsers.data?.content ?? []
          }
          ownersLoading={
            roles.isLoading ||
            ownerUsers.isLoading
          }
          onSubmit={submit}
          loading={
            create.isPending ||
            update.isPending
          }
        />

        {(create.isError ||
          update.isError) && (
          <p className="mt-3 text-sm text-rose-600">
            Unable to save the location.
          </p>
        )}

        {!roles.isLoading &&
          !ownerRole && (
            <p className="mt-3 text-sm text-rose-600">
              The OWNER role could not be found.
              A location cannot be created until an
              OWNER role is available.
            </p>
          )}

        {!roles.isLoading &&
          ownerRole &&
          !ownerUsers.isLoading &&
          ownerUsers.data?.empty && (
            <p className="mt-3 text-sm text-amber-600">
              No users with the OWNER role are
              available.
            </p>
          )}
      </Modal>

      {/* Quick View */}

      {view && (
        <QuickViewDialog
          open={!!view}
          onClose={() => setView(null)}
          title={view.name}
          eyebrow={`Location · ${view.code}`}
          fields={[
            {
              label: "Status",
              value: view.status,
            },
            {
              label: "Floor",
              value: String(view.floor),
            },
            {
              label: "Owner",
              value: selectedOwner
                ? `${selectedOwner.firstName} ${selectedOwner.lastName} (@${selectedOwner.username})`
                : `User #${view.ownerId}`,
            },
            {
              label: "Timezone",
              value: view.timeZone,
            },
            {
              label: "Phone",
              value: view.phone || "—",
            },
            {
              label: "Address",
              value: view.address || "—",
              wide: true,
            },
          ]}
        />
      )}

      {/* Operating Hours */}

      {hours && (
        <OperatingHoursDialog
          open={!!hours}
          onClose={() => setHours(null)}
          locationId={hours.id}
          locationName={hours.name}
        />
      )}
    </div>
  );}