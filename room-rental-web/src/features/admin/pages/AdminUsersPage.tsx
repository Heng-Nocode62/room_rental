
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

import { Eye, Lock, Plus, ShieldCheck, Unlock, UserX } from
  "../../../components/ui/MaterialIcon.tsx";

import { useUsers } from "../../users/hooks/useUsers";
import { useCreateUser } from "../../users/hooks/useCreateUser";
import { useUpdateUser } from "../../users/hooks/useUpdateUser";
import { useAssignUserRoles } from "../../users/hooks/useAssignUserRoles";
import { useLockUser } from "../../users/hooks/useLockUser";
import { useUnlockUser } from "../../users/hooks/useUnlockUser";
import { useDeactivateUser } from "../../users/hooks/useDeactivateUser";
import { useChangePassword } from "../../users/hooks/useChangePassword";
import { useResetPassword } from "../../users/hooks/useResetPassword";

import type { UserResponse, UserStatus } from "../../users/types/user";

import { UserFilters } from "../../users/components/UserFilters";
import { UserTable } from "../../users/components/UserTable";
import {
  UserForm,
  type UserFormValues,
} from "../../users/components/UserForm";

import { UserRoleManager } from "../../users/components/UserRoleManager";
import { useRoles } from "../../roles/hooks/roleHooks.ts";

export default function AdminUsersPage() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [roleId, setRoleId] = useState("");
  const [page, setPage] = useState(0);

  const [mode, setMode] = useState<
    | "create"
    | "view"
    | "edit"
    | "roles"
    | "change-password"
    | "reset-password"
    | "lock"
    | "unlock"
    | "deactivate"
    | null
  >(null);

  const [selected, setSelected] = useState<UserResponse | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /*
   * =========================
   * Queries
   * =========================
   */

  const roles = useRoles();

  const users = useUsers({
    keyword: keyword.trim() || undefined,
    status: status || undefined,
    roleId: roleId ? Number(roleId) : undefined,
    page,
    size: 20,
    sort: "username,asc",
  });

  /*
   * =========================
   * Mutations
   * =========================
   */

  const create = useCreateUser();
  const update = useUpdateUser();
  const assign = useAssignUserRoles();

  const lock = useLockUser();
  const unlock = useUnlockUser();
  const deactivate = useDeactivateUser();

  const changePassword = useChangePassword();
  const resetPassword = useResetPassword();

  /*
   * =========================
   * Helpers
   * =========================
   */

  const close = () => {
    setMode(null);
    setSelected(null);
    setPassword("");
    setConfirmPassword("");
  };

  const open = (
    nextMode:
      | "create"
      | "view"
      | "edit"
      | "roles"
      | "change-password"
      | "reset-password"
      | "lock"
      | "unlock"
      | "deactivate",
    user?: UserResponse,
  ) => {
    setSelected(user ?? null);
    setMode(nextMode);

    setPassword("");
    setConfirmPassword("");
  };

  /*
   * =========================
   * Create
   * =========================
   */

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

  /*
   * =========================
   * Edit
   * =========================
   */

  const editUser = async (values: UserFormValues) => {
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

  /*
   * =========================
   * Change password
   * =========================
   */

  const handleChangePassword = async () => {
    if (!selected) return;

    if (!password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    await changePassword.mutateAsync({
      id: selected.id,
      request: {
        password:password,
      confirmPassword: confirmPassword,
      },
    }
      
  );

    close();
  };

  /*
   * =========================
   * Reset password
   * =========================
   */

  const handleResetPassword = async () => {
    if (!selected) return;

    await resetPassword.mutateAsync(selected.id);

    close();
  };

  /*
   * =========================
   * Lock
   * =========================
   */

  const handleLock = async () => {
    if (!selected) return;

    await lock.mutateAsync(selected.id);

    close();
  };

  /*
   * =========================
   * Unlock
   * =========================
   */

  const handleUnlock = async () => {
    if (!selected) return;

    await unlock.mutateAsync(selected.id);

    close();
  };

  /*
   * =========================
   * Deactivate
   * =========================
   */

  const handleDeactivate = async () => {
    if (!selected) return;

    await deactivate.mutateAsync(selected.id);

    close();
  };

  /*
   * =========================
   * Render
   * =========================
   */

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Users"
        description="Manage user accounts, roles, passwords, and account status."
        actions={
          <Button
            leftIcon={<Plus size={17} />}
            onClick={() => open("create")}
          >
            Create user
          </Button>
        }
      />

      {/* Filters */}

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

      {/* Loading */}

      {users.isLoading && <LoadingState />}

      {/* Error */}

      {users.isError && (
        <EmptyState
          title="Unable to load users"
          description="Something went wrong while loading users."
          action={
            <Button
              variant="secondary"
              onClick={() => void users.refetch()}
            >
              Try again
            </Button>
          }
        />
      )}

      {/* Empty */}

      {!users.isLoading &&
        !users.isError &&
        users.data?.empty && (
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

      {/* Table */}

      {!users.isLoading &&
        !users.isError &&
        users.data &&
        !users.data.empty && (
          <>
            <UserTable
              users={users.data.content}

              onView={(user) => open("view", user)}

              onEdit={(user) => open("edit", user)}

              onRoles={(user) => open("roles", user)}

              onLock={(user) => open("lock", user)}

              onUnlock={(user) => open("unlock", user)}

              onDeactivate={(user) =>
                open("deactivate", user)
              }
            />

            <Pagination
              pagination={users.data}
              onPageChange={setPage}
            />
          </>
        )}

      {/* =====================================================
          CREATE USER
         ===================================================== */}

      <Modal
        open={mode === "create"}
        onClose={close}
        title="Create user"
      >
        <UserForm
          mode="create"
          onSubmit={createUser}
          loading={create.isPending}
        />
      </Modal>

      {/* =====================================================
          VIEW USER
         ===================================================== */}

      <Modal
        open={mode === "view"}
        onClose={close}
        title="User details"
        size="lg"
      >
        {selected && (
          <div className="space-y-6">
            {/* Header */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {selected.firstName} {selected.lastName}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  @{selected.username}
                </p>
              </div>

              <StatusBadge status={selected.status} />
            </div>

            {/* Information */}

            <div className="grid gap-4 sm:grid-cols-2">
              <Info
                label="Username"
                value={selected.username}
              />

              <Info
                label="Email"
                value={selected.email || "—"}
              />

              <Info
                label="Phone"
                value={selected.phone || "—"}
              />

              <Info
                label="Status"
                value={selected.status}
              />
            </div>

            {/* Roles */}

            <div>
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck size={17} />

                <h3 className="text-sm font-semibold text-slate-800">
                  Roles
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {selected.roles?.length ? (
                  selected.roles.map((role) => (
                    <span
                      key={role.id}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                    >
                      {role.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">
                    No roles assigned.
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}

            <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
              <Button
                variant="secondary"
                onClick={() => open("roles", selected)}
              >
                Manage roles
              </Button>

              <Button
                variant="secondary"
                onClick={() => open("change-password", selected)}
              >
                Change password
              </Button>

              <Button
                variant="secondary"
                onClick={() => open("edit", selected)}
              >
                Edit
              </Button>

              <Button onClick={close}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* =====================================================
          EDIT USER
         ===================================================== */}

      <Modal
        open={mode === "edit"}
        onClose={close}
        title="Edit user"
      >
        {selected && (
          <UserForm
            mode="edit"
            initialValues={{
              firstName: selected.firstName,
              lastName: selected.lastName,
              email: selected.email ?? "",
              phone: selected.phone ?? "",
            }}
            onSubmit={editUser}
            loading={update.isPending}
          />
        )}
      </Modal>

      {/* =====================================================
          MANAGE ROLES
         ===================================================== */}

      <Modal
        open={mode === "roles"}
        onClose={close}
        title={
          selected
            ? `Roles · ${selected.username}`
            : "Manage roles"
        }
      >
        {selected && roles.data && (
          <UserRoleManager
            user={selected}
            roles={roles.data}
          />
        )}
      </Modal>

      {/* =====================================================
          CHANGE PASSWORD
         ===================================================== */}

      <Modal
        open={mode === "change-password"}
        onClose={close}
        title="Change password"
      >
        {selected && (
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold text-slate-900">
                Change password
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Set a new password for @{selected.username}.
              </p>
            </div>

            <div className="space-y-4">
              <PasswordInput
                label="New password"
                value={password}
                onChange={setPassword}
              />

              <PasswordInput
                label="Confirm password"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />

              {password &&
                confirmPassword &&
                password !== confirmPassword && (
                  <p className="text-sm text-red-600">
                    Passwords do not match.
                  </p>
                )}
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                variant="secondary"
                onClick={close}
              >
                Cancel
              </Button>

              <Button
                disabled={
                  !password ||
                  !confirmPassword ||
                  password !== confirmPassword ||
                  changePassword.isPending
                }
                onClick={() =>
                  void handleChangePassword()
                }
              >
                {changePassword.isPending
                  ? "Changing..."
                  : "Change password"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* =====================================================
          RESET PASSWORD
         ===================================================== */}

      <Modal
        open={mode === "reset-password"}
        onClose={close}
        title="Reset password"
      >
        {selected && (
          <ConfirmDialog
            icon={<Unlock size={20} />}
            title="Reset this user's password?"
            description={`This will reset the password for @${selected.username}.`}
            cancelLabel="Cancel"
            confirmLabel="Reset password"
            loading={resetPassword.isPending}
            onCancel={close}
            onConfirm={() =>
              void handleResetPassword()
            }
          />
        )}
      </Modal>

      {/* =====================================================
          LOCK USER
         ===================================================== */}

      <Modal
        open={mode === "lock"}
        onClose={close}
        title="Lock user"
      >
        {selected && (
          <ConfirmDialog
            icon={<Lock size={20} />}
            title="Lock this user?"
            description={`@${selected.username} will no longer be able to access the system while the account is locked.`}
            cancelLabel="Cancel"
            confirmLabel="Lock user"
            loading={lock.isPending}
            onCancel={close}
            onConfirm={() => void handleLock()}
          />
        )}
      </Modal>

      {/* =====================================================
          UNLOCK USER
         ===================================================== */}

      <Modal
        open={mode === "unlock"}
        onClose={close}
        title="Unlock user"
      >
        {selected && (
          <ConfirmDialog
            icon={<Unlock size={20} />}
            title="Unlock this user?"
            description={`This will restore access for @${selected.username}.`}
            cancelLabel="Cancel"
            confirmLabel="Unlock user"
            loading={unlock.isPending}
            onCancel={close}
            onConfirm={() =>
              void handleUnlock()
            }
          />
        )}
      </Modal>

      {/* =====================================================
          DEACTIVATE USER
         ===================================================== */}

      <Modal
        open={mode === "deactivate"}
        onClose={close}
        title="Deactivate user"
      >
        {selected && (
          <ConfirmDialog
            icon={<UserX size={20} />}
            title="Deactivate this user?"
            description={`@${selected.username} will be deactivated and will no longer be able to use the account.`}
            cancelLabel="Cancel"
            confirmLabel="Deactivate"
            loading={deactivate.isPending}
            danger
            onCancel={close}
            onConfirm={() =>
              void handleDeactivate()
            }
          />
        )}
      </Modal>
    </div>
  );
}

/*
 * =========================================================
 * INFO
 * =========================================================
 */

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

/*
 * =========================================================
 * STATUS
 * =========================================================
 */

function StatusBadge({
  status,
}: {
  status: UserStatus;
}) {
  const styles: Record<string, string> = {
    ACTIVE:
      "bg-emerald-50 text-emerald-700 border-emerald-200",

    LOCKED:
      "bg-amber-50 text-amber-700 border-amber-200",

    INACTIVE:
      "bg-slate-100 text-slate-600 border-slate-200",

    DEACTIVATED:
      "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] ??
        "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {status}
    </span>
  );
}

/*
 * =========================================================
 * PASSWORD INPUT
 * =========================================================
 */

function PasswordInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />
    </div>
  );
}

/*
 * =========================================================
 * CONFIRMATION DIALOG
 * =========================================================
 */

function ConfirmDialog({
  icon,
  title,
  description,
  cancelLabel,
  confirmLabel,
  loading,
  danger = false,
  onCancel,
  onConfirm,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  loading: boolean;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            danger
              ? "bg-red-50 text-red-600"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {icon}
        </div>

        <div>
          <h3 className="font-semibold text-slate-900">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelLabel}
        </Button>

        <Button
          onClick={onConfirm}
          disabled={loading}
          className={
            danger
              ? "bg-red-600 hover:bg-red-700"
              : undefined
          }
        >
          {loading ? "Processing..." : confirmLabel}
        </Button>
      </div>
    </div>
  );
}