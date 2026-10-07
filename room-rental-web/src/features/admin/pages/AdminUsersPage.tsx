import { useState } from "react";
import {
  Button,
  Card,
  EmptyState,
  LoadingState,
  Modal,
  PageHeader,
  Pagination,
} from "../../../components/ui";
import {
  Eye,
  Lock,
  Plus,
  ShieldCheck,
  Unlock,
  UserX,
} from "../../../components/ui/MaterialIcon.tsx";
import { useUsers } from "../../users/hooks/useUsers";
import { useCreateUser } from "../../users/hooks/useCreateUser";
import { useUpdateUser } from "../../users/hooks/useUpdateUser";
import { useAssignUserRoles } from "../../users/hooks/useAssignUserRoles";
import { useLockUser } from "../../users/hooks/useLockUser";
import { useUnlockUser } from "../../users/hooks/useUnlockUser";
import { useDeactivateUser } from "../../users/hooks/useDeactivateUser";
import type { UserResponse, UserStatus } from "../../users/types/user";
import { UserFilters } from "../../users/components/UserFilters";
import { UserTable } from "../../users/components/UserTable";
import { UserForm, type UserFormValues } from "../../users/components/UserForm";
import { UserRoleManager } from "../../users/components/UserRoleManager";
import { useRoles } from "../../roles/hooks/roleHooks.ts";

export default function AdminUsersPage() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [roleId, setRoleId] = useState("");
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState<"create" | "edit" | "view" | "roles" | null>(
    null,
  );
  const [selected, setSelected] = useState<UserResponse | null>(null);

  const roles = useRoles();
  const users = useUsers({
    keyword: keyword.trim() || undefined,
    status: status || undefined,
    roleId: roleId ? Number(roleId) : undefined,
    page,
    size: 20,
    sort: "username,asc",
  });
  const create = useCreateUser();
  const update = useUpdateUser();
  const assign = useAssignUserRoles();
  const lock = useLockUser();
  const unlock = useUnlockUser();
  const deactivate = useDeactivateUser();

  const close = () => {
    setMode(null);
    setSelected(null);
  };
  const edit = async (values: UserFormValues) => {
    if (!selected) return;
    await update.mutateAsync({
      id: selected.id,
      request: {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim() || undefined,
        phone: values.phone.trim() || undefined,
      },
    });
    close();
  };
  const createUser = async (values: UserFormValues) => {
    await create.mutateAsync({
      username: values.username!.trim(),
      password: values.password!,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim() || undefined,
      phone: values.phone.trim() || undefined,
    });
    close();
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Users"
        description="Manage accounts, status, and global roles."
        actions={
          <Button
            leftIcon={<Plus size={17} />}
            onClick={() => setMode("create")}
          >
            Create user
          </Button>
        }
      />
      <Card>
        <UserFilters
          keyword={keyword}
          status={status}
          roleId={roleId}
          roles={roles.data ?? []}
          onKeywordChange={(value) => {
            setKeyword(value);
            setPage(0);
          }}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(0);
          }}
          onRoleChange={(value) => {
            setRoleId(value);
            setPage(0);
          }}
        />
      </Card>
      {users.isLoading && <LoadingState />}
      {users.isError && (
        <EmptyState
          title="Unable to load users"
          description="Something went wrong while loading users."
          action={
            <Button variant="secondary" onClick={() => void users.refetch()}>
              Try again
            </Button>
          }
        />
      )}
      {!users.isLoading && !users.isError && users.data?.empty && (
        <EmptyState
          title="No users found"
          description="No accounts match the current filters."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setKeyword("");
                setStatus("");
                setRoleId("");
                setPage(0);
              }}
            >
              Clear filters
            </Button>
          }
        />
      )}
      {!users.isLoading &&
        !users.isError &&
        users.data &&
        !users.data.empty && (
          <>
            <UserTable
              users={users.data.content}
              onView={(user: UserResponse) => {
                setSelected(user);
                setMode("view");
              }}
              onEdit={(user: UserResponse) => {
                setSelected(user);
                setMode("edit");
              }}
              onRoles={(user: UserResponse) => {
                setSelected(user);
                setMode("roles");
              }}
              onLock={(user: UserResponse) => void lock.mutateAsync(user.id)}
              onUnlock={(user: UserResponse) => void unlock.mutateAsync(user.id)}
              onDeactivate={(user: UserResponse) =>
                void deactivate.mutateAsync(user.id)
              }
            />
            <Pagination pagination={users.data} onPageChange={setPage} />
          </>
        )}

      <Modal open={mode === "create"} onClose={close} title="Create user">
        <UserForm
          mode="create"
          onSubmit={createUser}
          loading={create.isPending}
        />
      </Modal>
      <Modal open={mode === "edit"} onClose={close} title="Edit user">
        {selected && (
          <UserForm
            mode="edit"
            initialValues={{
              firstName: selected.firstName,
              lastName: selected.lastName,
              email: selected.email ?? "",
              phone: selected.phone ?? "",
            }}
            onSubmit={edit}
            loading={update.isPending}
          />
        )}
      </Modal>
      <Modal
        open={mode === "view"}
        onClose={close}
        title={
          selected
            ? `${selected.firstName} ${selected.lastName}`
            : "User details"
        }
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            <div>
              <p className="text-xl font-semibold text-slate-900">
                {selected.firstName} {selected.lastName}
              </p>
              <p className="text-sm text-slate-500">@{selected.username}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Email" value={selected.email || "—"} />
              <Info label="Phone" value={selected.phone || "—"} />
              <Info label="Status" value={selected.status} />
            </div>
            <div className="flex flex-wrap gap-2">
              {selected.roles.map((role) => (
                <span
                  key={role.id}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs"
                >
                  {role.name}
                </span>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={close}>
                Close
              </Button>
              <Button onClick={() => setMode("edit")}>Edit</Button>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        open={mode === "roles"}
        onClose={close}
        title={selected ? `Roles · ${selected.username}` : "Roles"}
      >
        {selected && roles.data && (
          <UserRoleManager user={selected} roles={roles.data} />
        )}
      </Modal>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
