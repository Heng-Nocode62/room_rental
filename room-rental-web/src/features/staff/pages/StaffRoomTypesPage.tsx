import { useState } from "react";
import { Plus, Sparkles } from "../../../components/ui/MaterialIcon.tsx";
import {
  Button,
  EmptyState,
  LoadingState,
  Modal,
  PageHeader,
  QuickViewDialog,
} from "../../../components/ui/index.ts";
import { useRoomTypes } from "../../room-types/hooks/useRoomTypes.ts";
import { useCreateRoomType } from "../../room-types/hooks/useCreateRoomType.ts";
import { useUpdateRoomType } from "../../room-types/hooks/useUpdateRoomType.ts";
import { useDeactivateRoomType } from "../../room-types/hooks/useDeactivateRoomType.ts";
import {
  StaffRoomTypeForm,
  type StaffRoomTypeFormValues,
} from "../components/room-types/StaffRoomTypeForm.tsx";
import { RoomTypeTable } from "../../room-types/components/RoomTypeTable";
import type { RoomTypeResponse } from "../../room-types/types/roomType.ts";
import { useTranslation } from "react-i18next";
export default function RoomTypesPage() {
    const {t} = useTranslation();
  const { data: roomTypes, isLoading, isError, refetch } = useRoomTypes();
  const create = useCreateRoomType();
  const update = useUpdateRoomType();
  const deactivate = useDeactivateRoomType();
  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<RoomTypeResponse | null>(null);
  const [view, setView] = useState<RoomTypeResponse | null>(null);
  const close = () => {
    setMode(null);
    setSelected(null);
  };
  const submit = async (v: StaffRoomTypeFormValues) => {
    const req = {
      name: v.name.trim(),
      description: v.description.trim() || undefined,
      capacity: v.capacity === "" ? undefined : v.capacity,
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
        icon={<Sparkles size={19} />}
        title={t("roomTypes")}
        actions={
          <Button
            leftIcon={<Plus size={17} />}
            onClick={() => setMode("create")}
          >
            Add room type
          </Button>
        }
      />
      {isLoading && <LoadingState />}
      {isError && (
        <EmptyState
          title="Unable to load room types"
          description="Something went wrong while loading room types."
          action={
            <Button variant="secondary" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      )}{" "}
      {!isLoading && !isError && !!roomTypes?.length && (
        <RoomTypeTable
          roomTypes={roomTypes}
          onView={setView}
          onEdit={(item) => {
            setSelected(item);
            setMode("edit");
          }}
          onToggle={(item) => {
            if (item.status === "ACTIVE") void deactivate.mutateAsync(item.id);
          }}
        />
      )}
      {!isLoading && !isError && roomTypes?.length === 0 && (
        <EmptyState
          title="No room types yet"
          description="Create a room type before you add rooms."
          action={
            <Button onClick={() => setMode("create")}>Add room type</Button>
          }
        />
      )}
      <Modal
        open={mode !== null}
        onClose={close}
        title={mode === "edit" ? "Edit room type" : "Add room type"}
      >
        <StaffRoomTypeForm
          key={`${mode}-${selected?.id ?? "new"}`}
          mode={mode || "create"}
          initialValues={selected ?? undefined}
          onSubmit={submit}
          loading={create.isPending || update.isPending}
        />
      </Modal>
      {view && (
        <QuickViewDialog
          open={!!view}
          onClose={() => setView(null)}
          title={view.name}
          eyebrow={view.code}
          fields={[
            { label: "Capacity", value: view.capacity ?? "—" },
            { label: "Status", value: view.status },
            {
              label: "Description",
              value: view.description || "—",
              wide: true,
            },
          ]}
        />
      )}
    </div>
  );
}
