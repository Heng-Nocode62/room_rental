import { useEffect, useState } from "react";

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
  Lock,
  Plus,
  ShieldCheck,
  Unlock,
  UserX,
} from "../../../components/ui/MaterialIcon.tsx";

import { useUsers } from "../../users/hooks/useUsers";
import { useCreateUser } from "../../users/hooks/useCreateUser";
import { useUpdateUser } from "../../users/hooks/useUpdateUser";
import { useLockUser } from "../../users/hooks/useLockUser";
import { useUnlockUser } from "../../users/hooks/useUnlockUser";
import { useDeactivateUser } from "../../users/hooks/useDeactivateUser";
import { useChangePassword } from "../../users/hooks/useChangePassword";
import { useResetPassword } from "../../users/hooks/useResetPassword";

import type { UserResponse, UserStatus } from "../../users/types/user";

import { UserFilters } from "../../users/components/UserFilters";
import { UserTable } from "../../users/components/UserTable";
import { UserAvatar } from "../../users/components/UserAvatar";
import { UserStatusBadge } from "../../users/components/UserStatusBadge";
import {
  UserForm,
  type UserFormValues,
} from "../../users/components/UserForm";

import { UserRoleManager } from "../../users/components/UserRoleManager";
import { useRoles } from "../../roles/hooks/roleHooks.ts";

type Mode =
  | "create"
  | "view"
  | "edit"
  | "roles"
  | "change-password"
  | "reset-password"
  | "lock"
  | "unlock"
  | "deactivate"
  | null;

type Notice = { type: "success" | "error"; message: string } | null;

export default function AdminUsersPage() {
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebouncedValue(keyword, 350);

  const [status, setStatus] = useState<UserStatus | "">("");
  const [roleId, setRoleId] = useState("");
  const [page, setPage] = useState(0);

  const [mode, setMode] = useState<Mode>(null);
  const [selected, setSelected] = useState<UserResponse | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [tempPassword, setTempPassword] = useState("");
  const [resetDone, setResetDone] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  /*
   * =========================
   * Queries
   * =========================
   */

  const roles = useRoles();

  const users = useUsers({
    keyword: debouncedKeyword.trim() || undefined,
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

  // Auto-dismiss success notices.
  useEffect(() => {
    if (!notice || notice.type !== "success") return;

    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const close = () => {
    setMode(null);
    setSelected(null);
    setPassword("");
    setConfirmPassword("");
    setTempPassword("");
    setResetDone(false);
    setFormError(null);
  };

  const open = (nextMode: Exclude<Mode, null>, user?: UserResponse) => {
    setSelected(user ?? null);
    setMode(nextMode);

    setPassword("");
    setConfirmPassword("");
    setResetDone(false);
    setFormError(null);

    setTempPassword(nextMode === "reset-password" ? generatePassword() : "");
  };

  const run = async (
    action: () => Promise<unknown>,
    successMessage: string,
    options: { keepOpen?: boolean } = {},
  ) => {
    setFormError(null);

    try {
      await action();

      setNotice({ type: "success", message: successMessage });

      if (!options.keepOpen) close();

      return true;
    } catch (error) {
      setFormError(getErrorMessage(error));
      return false;
    }
  };

  const fullName = (user: UserResponse) =>
    `${user.firstName} ${user.lastName}`.trim() || user.username;

  /*
   * =========================
   * Actions
   * =========================
   */

  const createUser = async (values: UserFormValues) => {
    await run(
      () =>
        create.mutateAsync({
          username: values.username!.trim(),
          password: values.password!,
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim() || undefined,
          phone: values.phone.trim() || undefined,
          roleId: values.roleId!, // validated as required in the form
        }),
      `User @${values.username!.trim()} created.`,
    );
  };

  const editUser = async (values: UserFormValues) => {
    if (!selected) return;

    await run(
      () =>
        update.mutateAsync({
          id: selected.id,
          request: {
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim() || undefined,
            phone: values.phone.trim() || undefined,
          },
        }),
      "User details updated.",
    );
  };

  const handleChangePassword = async () => {
    if (!selected || !password || password !== confirmPassword) return;

    await run(
      () =>
        changePassword.mutateAsync({
          id: selected.id,
          request: {
            currentPassword: "",
            newPassword: password,
          },
        }),
      `Password changed for @${selected.username}.`,
    );
  };

  const handleResetPassword = async () => {
    if (!selected || !tempPassword) return;

    const ok = await run(
      () =>
        resetPassword.mutateAsync({
          id: selected.id,
          request: { newPassword: tempPassword },
        }),
      `Password reset for @${selected.username}.`,
      { keepOpen: true },
    );

    if (ok) setResetDone(true);
  };

  const handleLock = async () => {
    if (!selected) return;
    await run(
      () => lock.mutateAsync(selected.id),
      `@${selected.username} was locked.`,
    );
  };

  const handleUnlock = async () => {
    if (!selected) return;
    await run(
      () => unlock.mutateAsync(selected.id),
      `@${selected.username} was unlocked.`,
    );
  };

  const handleDeactivate = async () => {
    if (!selected) return;
    await run(
      () => deactivate.mutateAsync(selected.id),
      `@${selected.username} was deactivated.`,
    );
  };

  const clearFilters = () => {
    setKeyword("");
    setStatus("");
    setRoleId("");
    setPage(0);
  };

  const totalElements = users.data
    ? (users.data as { totalElements?: number }).totalElements
    : undefined;

  const hasFilters = Boolean(keyword.trim() || status || roleId);

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
          <Button leftIcon={<Plus size={17} />} onClick={() => open("create")}>
            Create user
          </Button>
        }
      />

      {/* Notice */}

      {notice && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={[
            "flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm",
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800",
          ].join(" ")}
        >
          <p>{notice.message}</p>

          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setNotice(null)}
            className="text-lg leading-none opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      <Card>
        <UserFilters
          keyword={keyword}
          status={status}
          roleId={roleId}
          roles={roles.data ?? []}
          resultLabel={
            totalElements !== undefined
              ? `${totalElements} ${totalElements === 1 ? "user" : "users"}`
              : undefined
          }
          onClear={clearFilters}
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
            <Button variant="secondary" onClick={() => void users.refetch()}>
              Try again
            </Button>
          }
        />
      )}

      {/* Empty */}

      {!users.isLoading && !users.isError && users.data?.empty && (
        <EmptyState
          title={hasFilters ? "No users found" : "No users yet"}
          description={
            hasFilters
              ? "No accounts match the current filters."
              : "Create the first user account to get started."
          }
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Button
                leftIcon={<Plus size={17} />}
                onClick={() => open("create")}
              >
                Create user
              </Button>
            )
          }
        />
      )}

      {/* Table */}

      {!users.isLoading &&
        !users.isError &&
        users.data &&
        !users.data.empty && (
          <div
            className={[
              "space-y-4 transition-opacity",
              users.isFetching ? "opacity-60" : "opacity-100",
            ].join(" ")}
            aria-busy={users.isFetching}
          >
            <UserTable
              users={users.data.content}
              onView={(user) => open("view", user)}
              onEdit={(user) => open("edit", user)}
              onRoles={(user) => open("roles", user)}
              onChangePassword={(user) => open("change-password", user)}
              onResetPassword={(user) => open("reset-password", user)}
              onLock={(user) => open("lock", user)}
              onUnlock={(user) => open("unlock", user)}
              onDeactivate={(user) => open("deactivate", user)}
            />

            <Pagination pagination={users.data} onPageChange={setPage} />
          </div>
        )}

      {/* =====================================================
          CREATE USER
         ===================================================== */}

      <Modal open={mode === "create"} onClose={close} title="Create user">
        <UserForm
          mode="create"
          roles={roles.data ?? []}
          rolesLoading={roles.isLoading}
          onSubmit={createUser}
          onCancel={close}
          loading={create.isPending}
          error={mode === "create" ? formError : null}
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
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <UserAvatar
                  size="lg"
                  firstName={selected.firstName}
                  lastName={selected.lastName}
                  username={selected.username}
                />

                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {fullName(selected)}
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    @{selected.username}
                  </p>
                </div>
              </div>

              <UserStatusBadge status={selected.status} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Username" value={selected.username} />
              <Info label="Status" value={selected.status} />
              <Info label="Email" value={selected.email || "—"} />
              <Info label="Phone" value={selected.phone || "—"} />
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-slate-700">
                <ShieldCheck size={17} />
                <h3 className="text-sm font-semibold">Roles</h3>
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

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
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
            onSubmit={editUser}
            onCancel={close}
            loading={update.isPending}
            error={mode === "edit" ? formError : null}
          />
        )}
      </Modal>

      {/* =====================================================
          MANAGE ROLES
         ===================================================== */}

      <Modal
        open={mode === "roles"}
        onClose={close}
        title={selected ? `Roles · ${selected.username}` : "Manage roles"}
      >
        {selected && roles.isLoading && <LoadingState />}

        {selected && roles.isError && (
          <p className="text-sm text-red-600">Unable to load roles.</p>
        )}

        {selected && roles.data && (
          <UserRoleManager
            user={selected}
            roles={roles.data}
            onCancel={close}
            onSaved={() => {
              setNotice({
                type: "success",
                message: `Roles updated for @${selected.username}.`,
              });
              close();
            }}
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
            <p className="text-sm text-slate-500">
              Set a new password for{" "}
              <span className="font-medium text-slate-700">
                @{selected.username}
              </span>
              .
            </p>

            <div className="space-y-4">
              <PasswordInput
                label="New password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                showStrength
              />

              <PasswordInput
                label="Confirm password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
              />

              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-600">Passwords do not match.</p>
              )}

              {password.length > 0 && password.length < 8 && (
                <p className="text-xs text-slate-500">
                  Use at least 8 characters.
                </p>
              )}
            </div>

            {formError && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>

              <Button
                disabled={
                  password.length < 8 ||
                  password !== confirmPassword ||
                  changePassword.isPending
                }
                onClick={() => void handleChangePassword()}
              >
                {changePassword.isPending ? "Changing..." : "Change password"}
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
          <div className="space-y-5">
            <p className="text-sm leading-6 text-slate-500">
              {resetDone
                ? `The password for @${selected.username} has been reset. Copy it now and share it securely – it will not be shown again.`
                : `A temporary password will be set for @${selected.username}. Review or regenerate it below.`}
            </p>

            <TemporaryPassword
              value={tempPassword}
              onRegenerate={
                resetDone ? undefined : () => setTempPassword(generatePassword())
              }
            />

            {formError && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              {resetDone ? (
                <Button onClick={close}>Done</Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={close}
                    disabled={resetPassword.isPending}
                  >
                    Cancel
                  </Button>

                  <Button
                    loading={resetPassword.isPending}
                    onClick={() => void handleResetPassword()}
                  >
                    Reset password
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* =====================================================
          LOCK USER
         ===================================================== */}

      <Modal open={mode === "lock"} onClose={close} title="Lock user">
        {selected && (
          <ConfirmDialog
            icon={<Lock size={20} />}
            title="Lock this user?"
            description={`@${selected.username} will no longer be able to access the system while the account is locked.`}
            cancelLabel="Cancel"
            confirmLabel="Lock user"
            loading={lock.isPending}
            error={formError}
            onCancel={close}
            onConfirm={() => void handleLock()}
          />
        )}
      </Modal>

      {/* =====================================================
          UNLOCK USER
         ===================================================== */}

      <Modal open={mode === "unlock"} onClose={close} title="Unlock user">
        {selected && (
          <ConfirmDialog
            icon={<Unlock size={20} />}
            title="Unlock this user?"
            description={`This will restore access for @${selected.username}.`}
            cancelLabel="Cancel"
            confirmLabel="Unlock user"
            loading={unlock.isPending}
            error={formError}
            onCancel={close}
            onConfirm={() => void handleUnlock()}
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
            error={formError}
            danger
            onCancel={close}
            onConfirm={() => void handleDeactivate()}
          />
        )}
      </Modal>
    </div>
  );
}

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function generatePassword(length = 14) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

  const values = new Uint32Array(length);
  crypto.getRandomValues(values);

  return Array.from(values, (n) => chars[n % chars.length]).join("");
}

function getErrorMessage(error: unknown) {
  const message = (
    error as { response?: { data?: { message?: string } }; message?: string }
  )?.response?.data?.message;

  return (
    message ||
    (error as { message?: string })?.message ||
    "Something went wrong. Please try again."
  );
}

function passwordStrength(value: string) {
  let score = 0;

  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;

  return score; // 0–4
}

/*
 * =========================================================
 * INFO
 * =========================================================
 */

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
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
 * PASSWORD INPUT (show / hide + optional strength meter)
 * =========================================================
 */

function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
  showStrength = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  showStrength?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  const score = passwordStrength(value);
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "bg-red-500",
    "bg-red-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-emerald-600",
  ];

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-slate-300 py-2.5 pl-3 pr-16 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-2 px-2 text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      {showStrength && value && (
        <div className="mt-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={[
                  "h-1 flex-1 rounded-full",
                  step <= score ? colors[score] : "bg-slate-200",
                ].join(" ")}
              />
            ))}
          </div>

          <p className="mt-1 text-xs text-slate-500">{labels[score]}</p>
        </div>
      )}
    </div>
  );
}

/*
 * =========================================================
 * TEMPORARY PASSWORD (read-only, copy, regenerate)
 * =========================================================
 */

function TemporaryPassword({
  value,
  onRegenerate,
}: {
  value: string;
  onRegenerate?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be unavailable (insecure context) – ignore
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={value}
        onFocus={(event) => event.currentTarget.select()}
        aria-label="Temporary password"
        className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-sm text-slate-800 outline-none"
      />

      <Button variant="secondary" onClick={() => void copy()}>
        {copied ? "Copied" : "Copy"}
      </Button>

      {onRegenerate && (
        <Button variant="ghost" onClick={onRegenerate}>
          New
        </Button>
      )}
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
  error,
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
  error?: string | null;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            danger ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-700"
          }`}
        >
          {icon}
        </div>

        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>

        <Button
          onClick={onConfirm}
          disabled={loading}
          className={danger ? "bg-red-600 hover:bg-red-700" : undefined}
        >
          {loading ? "Processing..." : confirmLabel}
        </Button>
      </div>
    </div>
  );
}