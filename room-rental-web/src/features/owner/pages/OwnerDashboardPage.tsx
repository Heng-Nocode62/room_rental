import { Card, PageHeader } from "../../../components/ui";
import { LayoutDashboard } from "../../../components/ui/MaterialIcon.tsx";
import { useLocationScope } from "../../location-scope/LocationScopeProvider";
export default function OwnerDashboardPage() {
  const { currentLocation } = useLocationScope();
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        icon={<LayoutDashboard size={19} />}
        title="Dashboard"
        description={
          currentLocation
            ? `Management overview for ${currentLocation.name}.`
            : "Location management overview."
        }
      />
      <Card>
        <p className="text-sm text-slate-600">
          Choose the operational page from the owner navigation.
        </p>
      </Card>
    </div>
  );
}
