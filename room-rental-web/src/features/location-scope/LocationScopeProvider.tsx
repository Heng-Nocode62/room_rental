import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useCurrentUser } from "../auth/hooks/useCurrentUser";
import { useLocations } from "../locations/hooks/useLocations";
import { useUserLocationRolesByUser } from "../user-location-roles/hooks/useUserLocationRolesByUser";
import type { LocationResponse } from "../locations/types/location";

interface LocationScopeValue {
  locations: LocationResponse[];
  currentLocation: LocationResponse | null;
  currentLocationId: number | null;
  setCurrentLocationId: (id: number) => void;
  isLoading: boolean;
  isError: boolean;
}

const Context = createContext<LocationScopeValue | null>(null);
const storageKey = "roomrental.currentLocationId";

export function LocationScopeProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading: userLoading, isError: userError } = useCurrentUser();
  const assignments = useUserLocationRolesByUser(user?.id);
  const locationsQuery = useLocations();
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const value = Number(localStorage.getItem(storageKey));
    return Number.isFinite(value) && value > 0 ? value : null;
  });

  const locations = useMemo(() => {
    const all = locationsQuery.data ?? [];
    const ids = new Set((assignments.data ?? []).map((item) => item.locationId));
    return all.filter((location) => ids.has(location.id));
  }, [assignments.data, locationsQuery.data]);

  useEffect(() => {
    if (locations.length === 0) return;
    if (!selectedId || !locations.some((item) => item.id === selectedId)) {
      setSelectedId(locations[0].id);
      localStorage.setItem(storageKey, String(locations[0].id));
    }
  }, [locations, selectedId]);

  const currentLocation = locations.find((item) => item.id === selectedId) ?? null;
  const setCurrentLocationId = (id: number) => {
    setSelectedId(id);
    localStorage.setItem(storageKey, String(id));
  };

  return (
    <Context.Provider value={{
      locations,
      currentLocation,
      currentLocationId: currentLocation?.id ?? null,
      setCurrentLocationId,
      isLoading: userLoading || assignments.isLoading || locationsQuery.isLoading,
      isError: userError || assignments.isError || locationsQuery.isError,
    }}>
      {children}
    </Context.Provider>
  );
}

export function useLocationScope() {
  const context = useContext(Context);
  if (!context) throw new Error("useLocationScope must be used inside LocationScopeProvider");
  return context;
}


export function useOptionalLocationScope() {
  return useContext(Context);
}
