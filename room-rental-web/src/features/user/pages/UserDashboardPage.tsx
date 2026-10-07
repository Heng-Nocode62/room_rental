import { Card, PageHeader } from "../../../components/ui";
import { LayoutDashboard } from "../../../components/ui/MaterialIcon.tsx";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
export default function UserDashboardPage() {
  const { data: user } = useCurrentUser();
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        icon={<LayoutDashboard size={19} />}
        title="Welcome"
        description={
          user
            ? `${user.firstName} ${user.lastName}`
            : "Your room rental account."
        }
      />
      <Card>
        <p className="text-sm text-slate-600">
          Browse availability and manage your reservations.
        </p>
      </Card>
    </div>
  );
}
