import { useMemo, useState } from "react";
import {
  Button,
  EmptyState,
  Input,
  LoadingState,
  Modal,
  PageHeader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../../components/ui";
import {
  Edit3,
  Plus,
  Trash2,
  Users,
} from "../../../components/ui/MaterialIcon.tsx";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useUsers } from "../../users/hooks/useUsers";
import { useLocationScope } from "../../location-scope/LocationScopeProvider";
import { useUserLocationRolesByLocation } from "../../user-location-roles/hooks/useUserLocationRolesByLocation";
import { useCreateUserLocationRole } from "../../user-location-roles/hooks/useCreateUserLocationRole";
import { useUpdateUserLocationRole } from "../../user-location-roles/hooks/useUpdateUserLocationRole";
import { useDeleteUserLocationRole } from "../../user-location-roles/hooks/useDeleteUserLocationRole";
import type { UserLocationRoleResponse } from "../../user-location-roles/types/userLocationRole";
import { useRoles } from "../../roles/hooks/roleHooks.ts";

export default function OwnerStaffPage() {
  const scope = useLocationScope();
  const { data: me } = useCurrentUser();
  const roles = useRoles();
  const assignments = useUserLocationRolesByLocation(
    scope.currentLocationId ?? undefined,
  );
  const users = useUsers({ page: 0, size: 200, sort: "username,asc" });
  const create = useCreateUserLocationRole();
  const update = useUpdateUserLocationRole();
  const remove = useDeleteUserLocationRole();
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<UserLocationRoleResponse | null>(
    null,
  );
  const [open, setOpen] = useState(false);
  const staffRoles = useMemo(
    () =>
      (roles.data ?? []).filter(
        (r) =>
          !["ADMIN", "SUPER_ADMIN", "SHOP_OWNER", "OWNER"].includes(
            r.code.toUpperCase(),
          ),
      ),
    [roles.data],
  );
  const byId = new Map((users.data?.content ?? []).map((u) => [u.id, u]));
  const visible = (assignments.data ?? [])
    .filter((a) => a.userId !== me?.id)
    .filter((a) => {
      const u = byId.get(a.userId);
      return (
        !keyword.trim() ||
        `${u?.firstName ?? ""} ${u?.lastName ?? ""} ${u?.username ?? ""}`
          .toLowerCase()
          .includes(keyword.toLowerCase())
      );
    });
  const close = () => {
    setOpen(false);
    setSelected(null);
  };
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const userId = Number(fd.get("userId"));
    const roleId = Number(fd.get("roleId"));
    if (!scope.currentLocationId) return;
    if (selected)
      await update.mutateAsync({
        id: selected.id,
        request: { userId, locationId: scope.currentLocationId, roleId },
      });
    else
      await create.mutateAsync({
        userId,
        locationId: scope.currentLocationId,
        roleId,
      });
    close();
  };
  if (
    scope.isLoading ||
    assignments.isLoading ||
    roles.isLoading ||
    users.isLoading
  )
    return <LoadingState />;
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        icon={<Users size={19} />}
        title="Staff"
        description={`Manage staff assigned to ${scope.currentLocation?.name ?? "this location"}.`}
        actions={
          <Button leftIcon={<Plus size={17} />} onClick={() => setOpen(true)}>
            Assign staff
          </Button>
        }
      />
      <div className="max-w-sm">
        <Input
          label="Search staff"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Name or username"
        />
      </div>
      {visible.length === 0 ? (
        <EmptyState
          title="No staff assigned"
          description="Assign a staff member to this location."
          action={<Button onClick={() => setOpen(true)}>Assign staff</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Staff</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="text-right">Action</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((a) => {
                const u = byId.get(a.userId);
                const r = (roles.data ?? []).find((x) => x.id === a.roleId);
                return (
                  <TableRow key={a.id}>
                    <TableCell>
                      <p className="font-semibold text-slate-900">
                        {u
                          ? `${u.firstName} ${u.lastName}`
                          : `User #${a.userId}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        {u ? `@${u.username}` : ""}
                      </p>
                    </TableCell>
                    <TableCell>{r?.name ?? `Role #${a.roleId}`}</TableCell>
                    <TableCell>{u?.status ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Edit3 size={15} />}
                          onClick={() => {
                            setSelected(a);
                            setOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Trash2 size={15} />}
                          onClick={() => {
                            if (window.confirm("Remove this staff assignment?"))
                              void remove.mutateAsync(a.id);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <Modal
        open={open}
        onClose={close}
        title={selected ? "Edit staff assignment" : "Assign staff"}
      >
        <form onSubmit={submit} className="space-y-5">
          <Select
            label="Staff user"
            name="userId"
            defaultValue={selected?.userId ? String(selected.userId) : ""}
            disabled={Boolean(selected)}
            options={[
              { label: "Select user", value: "" },
              ...(users.data?.content ?? [])
                .filter((u) => u.id !== me?.id)
                .map((u) => ({
                  label: `${u.firstName} ${u.lastName} · @${u.username}`,
                  value: String(u.id),
                })),
            ]}
          />
          <Select
            label="Role"
            name="roleId"
            defaultValue={selected?.roleId ? String(selected.roleId) : ""}
            options={[
              { label: "Select role", value: "" },
              ...staffRoles.map((r) => ({
                label: r.name,
                value: String(r.id),
              })),
            ]}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={create.isPending || update.isPending}
            >
              {selected ? "Save assignment" : "Assign staff"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
