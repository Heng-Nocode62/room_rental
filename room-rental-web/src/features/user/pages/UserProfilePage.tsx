import { useState } from "react";
import { Button, Card, Modal, PageHeader } from "../../../components/ui";
import { Settings2 } from "../../../components/ui/MaterialIcon.tsx";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useUpdateUser } from "../../users/hooks/useUpdateUser";
import { UserForm, type UserFormValues } from "../../users/components/UserForm";
export default function UserProfilePage() {
  const { data: user, refetch } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const update = useUpdateUser();
  if (!user) return null;
  const save = async (v: UserFormValues) => {
    await update.mutateAsync({
      id: user.id,
      request: {
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        email: v.email.trim() || undefined,
        phone: v.phone.trim() || undefined,
      },
    });
    await refetch();
    setOpen(false);
  };
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <PageHeader
        icon={<Settings2 size={19} />}
        title="My Profile"
        description="Manage your profile information."
        actions={
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Edit profile
          </Button>
        }
      />
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Info label="Username" value={user.username} />
          <Info label="Email" value={user.email || "—"} />
          <Info label="Phone" value={user.phone || "—"} />
          <Info label="Status" value="Active" />
        </div>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="Edit profile">
        <UserForm
          mode="edit"
          initialValues={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email || "",
            phone: user.phone || "",
          }}
          onSubmit={save}
          loading={update.isPending}
        />
      </Modal>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
