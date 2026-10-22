import { RoomBlocksPageView } from "../../room-blocks/components/RoomBlocksPageView";
import { OwnerRoomBlockCreateDialog } from "../components/room-blocks/OwnerRoomBlockCreateDialog.tsx";
import { useLocationScope } from "../../location-scope/LocationScopeProvider";

export default function OwnerRoomBlocksPage() {
  const scope = useLocationScope();

  const locationId = scope.currentLocationId ?? undefined;

  return (
    <RoomBlocksPageView
      locationId={locationId}
      renderCreateDialog={(props) => (
        <OwnerRoomBlockCreateDialog {...props} locationId={locationId} />
      )}
    />
  );
}
