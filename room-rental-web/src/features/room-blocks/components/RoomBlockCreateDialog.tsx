import { useMemo, useState } from "react";
import { Ban } from "../../../components/ui/MaterialIcon.tsx";
import { Modal } from "../../../components/ui";
import { useRooms } from "../../rooms/hooks/useRooms";
import { useLocations } from "../../locations/hooks/useLocations";
import { useCreateRoomBlock } from "../hooks/useCreateRoomBlock";
import {
  combineLocalDateAndTime,
  validateReservationTime,
} from "../../../lib/dateTime";
import { RoomBlockForm, type RoomBlockFormValues } from "./RoomBlockForm";
import type { RoomBlockRoomOption } from "../types/roomBlockForm";
interface Props {
  open: boolean;
  onClose: () => void;
  locationId?: number;
}
export function RoomBlockCreateDialog({ open, onClose, locationId }: Props) {
  const { data: roomPage, isLoading: roomsLoading } = useRooms({
    locationId,
    page: 0,
    size: 100,
    sort: "roomNumber,asc",
  });
  const { data: locations, isLoading: locationsLoading } = useLocations();
  const create = useCreateRoomBlock();
  const [timeError, setTimeError] = useState<string>();
  const rooms = useMemo<RoomBlockRoomOption[]>(() => {
    if (!roomPage?.content || !locations) return [];
    const map = new Map(locations.map((l) => [l.id, l]));
    return roomPage.content
      .map((room) => {
        const location = map.get(room.locationId);
        return location
          ? {
              id: room.id,
              roomNumber: room.roomNumber,
              name: room.name,
              locationId: room.locationId,
              locationName: room.locationName,
              timeZone: location.timeZone,
            }
          : null;
      })
      .filter((r): r is RoomBlockRoomOption => !!r);
  }, [roomPage?.content, locations]);
  const submit = async (v: RoomBlockFormValues) => {
    const room = rooms.find((r) => r.id === Number(v.roomId));
    if (!room) return;
    const error = validateReservationTime(
      v.startDate,
      v.startTime,
      v.endDate,
      v.endTime,
      room.timeZone,
    );
    if (error) {
      setTimeError(error);
      return;
    }
    setTimeError(undefined);
    await create.mutateAsync({
      roomId: room.id,
      blockType: v.blockType,
      startAt: combineLocalDateAndTime(v.startDate, v.startTime, room.timeZone),
      endAt: combineLocalDateAndTime(v.endDate, v.endTime, room.timeZone),
      reason: v.reason.trim() || undefined,
      notes: v.notes.trim() || undefined,
    });
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Block a room"
      description="Temporarily remove a room from the booking grid."
      size="lg"
    >
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Ban size={17} />
        <span>
          Use this for maintenance, cleaning, private events, or planned
          downtime.
        </span>
      </div>
      {roomsLoading || locationsLoading ? (
        <p className="text-sm text-slate-500">Loading rooms…</p>
      ) : (
        <RoomBlockForm
          rooms={rooms}
          onSubmit={submit}
          loading={create.isPending}
          timeError={timeError}
        />
      )}
    </Modal>
  );
}
