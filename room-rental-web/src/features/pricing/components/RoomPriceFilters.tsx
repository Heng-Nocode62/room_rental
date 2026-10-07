import { Select, Input } from "../../../components/ui";
import type { RoomPriceStatus } from "../types/roomPrice";
import type { RoomResponse } from "../../rooms/types/room";

interface Props {
  rooms: RoomResponse[];
  roomId: string;
  status: RoomPriceStatus | "";
  effectiveDate: string;
  onRoomIdChange: (value: string) => void;
  onStatusChange: (value: RoomPriceStatus | "") => void;
  onEffectiveDateChange: (value: string) => void;
}

export function RoomPriceFilters({ rooms, roomId, status, effectiveDate, onRoomIdChange, onStatusChange, onEffectiveDateChange }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Select label="Room" value={roomId} onChange={(event) => onRoomIdChange(event.target.value)}
        options={[{ value: "", label: "All rooms" }, ...rooms.map((room) => ({
          value: String(room.id), label: `${room.roomNumber} — ${room.name}`,
        }))]}
      />
      <Select label="Status" value={status} onChange={(event) => onStatusChange(event.target.value as RoomPriceStatus | "")}
        options={[{ value: "", label: "All statuses" }, { value: "ACTIVE", label: "Active" }, { value: "INACTIVE", label: "Inactive" }]}
      />
      <Input placeholder=" " label="Effective date" type="date" value={effectiveDate} onChange={(event) => onEffectiveDateChange(event.target.value)} />
    </div>
  );
}
