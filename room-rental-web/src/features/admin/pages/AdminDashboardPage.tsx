import { Card, PageHeader } from "../../../components/ui";
import { Settings2 } from "../../../components/ui/MaterialIcon.tsx";

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader icon={<Settings2 size={19} />} title="Dashboard" description="System-wide administration and configuration." />
      <Card><p className="text-sm text-slate-600">Use the administrator navigation to manage the entire room rental platform.</p></Card>
    </div>
  );
}
