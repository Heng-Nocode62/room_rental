import { CalendarCheck, CalendarDays, ClipboardList, DoorOpen, MapPin, PackagePlus, Settings2, Tag, Tags, Users } from "../../components/ui/MaterialIcon.tsx";
import RoleLayoutShell, { type RoleNavItem } from "./RoleLayoutShell";
import { useLocationScope } from "../../features/location-scope/LocationScopeProvider";

const nav: RoleNavItem[] = [
  { label: "Dashboard", path: "/owner/dashboard", icon: <Settings2 size={18} /> },
  { label: "Rooms", path: "/owner/rooms", icon: <DoorOpen size={18} /> },
  { label: "Hourly Availability", path: "/availability/hourly", icon: <CalendarCheck size={18} /> },
  { label: "Daily Availability", path: "/availability/daily", icon: <CalendarDays size={18} /> },
  { label: "Reservations", path: "/owner/reservations", icon: <ClipboardList size={18} /> },
  { label: "Room Blocks", path: "/owner/room-blocks", icon: <PackagePlus size={18} /> },
  { label: "Room Types", path: "/owner/room-types", icon: <Tags size={18} /> },
  { label: "Amenities", path: "/owner/amenities", icon: <Tag size={18} /> },
  { label: "Room Prices", path: "/owner/room-prices", icon: <Tags size={18} /> },
  { label: "Staff", path: "/owner/staff", icon: <Users size={18} /> },
  { label: "Location", path: "/owner/location", icon: <MapPin size={18} /> },
];

export default function OwnerLayout() {
  const scope = useLocationScope();
  return (
    <RoleLayoutShell
      title="Owner"
      nav={nav}
      locationName={scope.currentLocation?.name}
      locations={scope.locations}
      currentLocationId={scope.currentLocationId}
      onLocationChange={scope.setCurrentLocationId}
    />
  );
}
