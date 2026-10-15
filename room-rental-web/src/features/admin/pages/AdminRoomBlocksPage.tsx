import { RoomBlocksPageView } from "../../room-blocks/components/RoomBlocksPageView";
import { AdminRoomBlockCreateDialog } from "../components/room-blocks/AdminRoomBlockCreateDialog.tsx";

export default function AdminRoomBlocksPage() {
  return (
    <RoomBlocksPageView
      renderCreateDialog={(props) => <AdminRoomBlockCreateDialog {...props} />}
    />
  );
}