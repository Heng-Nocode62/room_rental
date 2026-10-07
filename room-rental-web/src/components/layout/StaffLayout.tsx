import { CalendarCheck, CalendarDays, ClipboardList, DoorOpen, PackagePlus, Tag, Tags } from "../../components/ui/MaterialIcon.tsx";
import RoleLayoutShell, { type RoleNavItem } from "./RoleLayoutShell";
import { useLocationScope } from "../../features/location-scope/LocationScopeProvider";

const nav: RoleNavItem[] = [
  { label: "Dashboard", path: "/staff/dashboard", icon: <DoorOpen size={18} /> },
  { label: "Rooms", path: "/staff/rooms", icon: <DoorOpen size={18} /> },
  { label: "Hourly Availability", path: "/availability/hourly", icon: <CalendarCheck size={18} /> },
  { label: "Daily Availability", path: "/availability/daily", icon: <CalendarDays size={18} /> },
  { label: "Reservations", path: "/staff/reservations", icon: <ClipboardList size={18} /> },
  { label: "Room Blocks", path: "/staff/room-blocks", icon: <PackagePlus size={18} /> },
  { label: "Room Types", path: "/staff/room-types", icon: <Tags size={18} /> },
  { label: "Amenities", path: "/staff/amenities", icon: <Tag size={18} /> },
  { label: "Room Prices", path: "/staff/room-prices", icon: <Tags size={18} /> },
];

export default function StaffLayout() {
  const scope = useLocationScope();
  return (
    <RoleLayoutShell
      title="Staff"
      nav={nav}
      locationName={scope.currentLocation?.name}
      locations={scope.locations.length > 1 ? scope.locations : undefined}
      currentLocationId={scope.currentLocationId}
      onLocationChange={scope.setCurrentLocationId}
    />
  );
}
