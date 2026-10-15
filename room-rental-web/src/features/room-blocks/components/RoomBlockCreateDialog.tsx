import { useMemo, useState } from "react";
import { Ban } from "../../../components/ui/MaterialIcon.tsx";
import { Modal } from "../../../components/ui";
import { useRooms } from "../../rooms/hooks/useRooms";
import { useLocations } from "../../locations/hooks/useLocations";
import { getErrorMessage } from "../../rooms/utils/roomUtils";
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
  /** Called after the block was created (before the dialog closes) */
  onCreated?: () => void;
}

export function RoomBlockCreateDialog({
  open,
  onClose,
  locationId,
  onCreated,
}: Props) {
  const { data: roomPage, isLoading: roomsLoading } = useRooms({
    locationId,
    page: 0,
    size: 100,
    sort: "roomNumber,asc",
  });

  const { data: locations, isLoading: locationsLoading } = useLocations();

  const create = useCreateRoomBlock();

  const [timeError, setTimeError] = useState<string>();
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const handleClose = () => {
    setTimeError(undefined);
    setSubmitError(null);
    onClose();
  };

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
    setSubmitError(null);

    try {
      await create.mutateAsync({
        roomId: room.id,
        blockType: v.blockType,
        startAt: combineLocalDateAndTime(v.startDate, v.startTime, room.timeZone),
        endAt: combineLocalDateAndTime(v.endDate, v.endTime, room.timeZone),
        reason: v.reason.trim() || undefined,
        notes: v.notes.trim() || undefined,
      });
    } catch (err) {
      setSubmitError(
        getErrorMessage(err, "Unable to create the room block. Please try again."),
      );
      return;
    }

    onCreated?.();
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Block a room"
      description="Temporarily remove a room from the booking grid."
      size="lg"
    >
      <div className="mb-6 flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Ban size={17} />
        <span>
          Use this for maintenance, cleaning, private events, or planned
          downtime.
        </span>
      </div>

      {roomsLoading || locationsLoading ? (
        <p className="py-10 text-center text-sm text-slate-500">
          Loading rooms…
        </p>
      ) : (
        <RoomBlockForm
          rooms={rooms}
          onSubmit={submit}
          onCancel={handleClose}
          loading={create.isPending}
          timeError={timeError}
          error={submitError}
        />
      )}
    </Modal>
  );
}