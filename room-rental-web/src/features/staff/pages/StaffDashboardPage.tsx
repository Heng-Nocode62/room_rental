import { Card, PageHeader } from "../../../components/ui";
import { LayoutDashboard } from "../../../components/ui/MaterialIcon.tsx";
import { useLocationScope } from "../../location-scope/LocationScopeProvider";
export default function StaffDashboardPage(){ const { currentLocation } = useLocationScope(); return <div className="mx-auto w-full max-w-7xl space-y-6"><PageHeader icon={<LayoutDashboard size={19}/>} title="Dashboard" description={currentLocation ? `Operational workspace for ${currentLocation.name}.` : "Operational workspace."}/><Card><p className="text-sm text-slate-600">Use the staff navigation to manage daily location operations.</p></Card></div>; }
