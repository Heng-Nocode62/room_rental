import { useState } from "react";
import { DoorOpen, Plus } from "../../../components/ui/MaterialIcon.tsx";
import { Button, EmptyState, LoadingState, Modal, PageHeader } from "../../../components/ui";
import { useRooms } from "../../rooms/hooks/useRooms";
import { useRoomTypes } from "../../room-types/hooks/useRoomTypes";
import { useCreateRoom } from "../../rooms/hooks/useCreateRoom";
import { useUpdateRoom } from "../../rooms/hooks/useUpdateRoom";
import { useDeactivateRoom } from "../../rooms/hooks/useDeactivateRoom";
import { useLocationScope } from "../../location-scope/LocationScopeProvider";
import type { RoomResponse } from "../../rooms/types/room";
import { RoomTable } from "../../rooms/components/RoomTable";
import { StaffRoomForm } from "../components/rooms/StaffRoomForm.tsx";
import { RoomAmenityManager } from "../../rooms/components/RoomAmenityManager";

export default function StaffRoomsPage() {
  const scope = useLocationScope();
  const [dialog, setDialog] = useState<"create" | "edit" | "view" | "amenities" | null>(null);
  const [selected, setSelected] = useState<RoomResponse | null>(null);
  const rooms = useRooms({ locationId: scope.currentLocationId ?? undefined, page: 0, size: 100, sort: "roomNumber,asc" });
  const roomTypes = useRoomTypes();
  const create = useCreateRoom();
  const update = useUpdateRoom();
  const deactivate = useDeactivateRoom();
  const close = () => { setDialog(null); setSelected(null); };

  const submit = async (values: any) => {
    if (dialog === "edit" && selected) {
      await update.mutateAsync({ id: selected.id, request: { name: values.name.trim(), floor: values.floor.trim() || undefined, description: values.description.trim() || undefined } });
    } else if (scope.currentLocationId) {
      await create.mutateAsync({ locationId: scope.currentLocationId, roomTypeId: Number(values.roomTypeId), roomNumber: values.roomNumber.trim(), name: values.name.trim(), floor: values.floor.trim() || undefined, description: values.description.trim() || undefined, amenities: (values.amenities ?? []).map((item: any) => ({ amenityId: Number(item.amenityId), amount: Number(item.amount) })) });
    }
    close();
  };

  if (scope.isLoading) return <LoadingState />;
  if (!scope.currentLocationId) return <EmptyState title="No location available" description="This account is not assigned to a location." />;
  const items = rooms.data?.content ?? [];

  return <div className="mx-auto w-full max-w-[1600px] space-y-6">
    <PageHeader icon={<DoorOpen size={19} />} title="Rooms" description={`Manage rooms for ${scope.currentLocation?.name ?? "this location"}.`} actions={<Button leftIcon={<Plus size={17} />} onClick={() => setDialog("create")}>Add room</Button>} />
    {rooms.isLoading && <LoadingState />}
    {rooms.isError && <EmptyState title="Unable to load rooms" description="Something went wrong while loading rooms." action={<Button variant="secondary" onClick={() => void rooms.refetch()}>Try again</Button>} />}
    {!rooms.isLoading && !rooms.isError && items.length === 0 && <EmptyState title="No rooms found" description="Create a room for this location." action={<Button onClick={() => setDialog("create")}>Add room</Button>} />}
    {!rooms.isLoading && !rooms.isError && items.length > 0 && <div className="overflow-hidden rounded-xl border border-slate-200 bg-white"><RoomTable rooms={items} onView={(item) => { setSelected(item); setDialog("view"); }} onEdit={(item) => { setSelected(item); setDialog("edit"); }} onAmenities={(item) => { setSelected(item); setDialog("amenities"); }} onToggle={(item) => void deactivate.mutateAsync(item.id)} /></div>}

    <Modal open={dialog === "create" || dialog === "edit"} onClose={close} title={dialog === "edit" ? "Edit room" : "Add room"} size="lg">
      <StaffRoomForm key={`${dialog}-${selected?.id ?? "new"}`} locations={scope.currentLocation ? [scope.currentLocation] : []} roomTypes={roomTypes.data ?? []} mode={dialog === "edit" ? "edit" : "create"} initialValues={selected ? { locationId: String(selected.locationId), roomTypeId: String(selected.roomTypeId), roomNumber: selected.roomNumber, name: selected.name, floor: selected.floor ?? "", description: selected.description ?? "", amenities: selected.amenities.map((a: any) => ({ amenityId: String(a.amenityId), amount: a.amount })) } : undefined} onSubmit={submit} loading={create.isPending || update.isPending} fixedLocationId={scope.currentLocationId ?? undefined} />
    </Modal>

    <Modal open={dialog === "view"} onClose={close} title={selected ? `${selected.roomNumber} · ${selected.name}` : "Room details"}>
      {selected && <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Info label="Room number" value={selected.roomNumber} /><Info label="Type" value={selected.roomTypeName} /><Info label="Floor" value={selected.floor || "—"} /><Info label="Capacity" value={String(selected.capacity)} /><Info label="Status" value={selected.status} /></div><p className="text-sm text-slate-600">{selected.description || "No description."}</p><div className="flex justify-end"><Button variant="secondary" onClick={close}>Close</Button></div></div>}
    </Modal>

    <Modal open={dialog === "amenities"} onClose={close} title={selected ? `Amenities · ${selected.roomNumber}` : "Room amenities"} size="lg">
      {selected && <RoomAmenityManager roomId={selected.id} locationId={selected.locationId} currentAmenities={selected.amenities} />}
    </Modal>
  </div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-sm font-medium text-slate-800">{value}</p></div>;
}
