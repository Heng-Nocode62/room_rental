import { useQuery } from "@tanstack/react-query";

import { roomApi } from "../api/roomApi";
import { roomKeys } from "./roomKeys";

export function useRoomAmenities(roomId: number, enabled = true) {
  return useQuery({
    queryKey: roomKeys.amenities(roomId),
    queryFn: () => roomApi.getAmenities(roomId),
    enabled: enabled && Number.isFinite(roomId),
    staleTime: 30_000,
  });
}
