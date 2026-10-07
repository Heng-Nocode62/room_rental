import { useQuery } from "@tanstack/react-query";

import { roomApi } from "../api/roomApi";
import { roomKeys } from "./roomKeys";

export function useRoom(id: number) {
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: () => roomApi.getById(id),
    enabled: Number.isFinite(id),
    staleTime: 15_000,
  });
}
