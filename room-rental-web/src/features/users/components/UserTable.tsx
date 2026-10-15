import { useEffect, useRef, useState, type CSSProperties } from "react";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../../components/ui";

import {
  Edit,
  Eye,
  Lock,
  ShieldCheck,
  Unlock,
  UserX,
} from "../../../components/ui/MaterialIcon.tsx";

import type { UserResponse } from "../types/user";

import { UserAvatar } from "./UserAvatar";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserRoleBadge } from "./UserRoleBadge";

type UserActions = {
  onView: (user: UserResponse) => void;
  onEdit: (user: UserResponse) => void;
  onRoles: (user: UserResponse) => void;
  onChangePassword: (user: UserResponse) => void;
  onResetPassword: (user: UserResponse) => void;
  onLock: (user: UserResponse) => void;
  onUnlock: (user: UserResponse) => void;
  onDeactivate: (user: UserResponse) => void;
};

type UserTableProps = UserActions & {
  users: UserResponse[];
};

export function UserTable({ users, ...actions }: UserTableProps) {
  return (
    <>
      {/* Desktop / tablet: table */}
      <div className="hidden md:block">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>User</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>Roles</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => actions.onView(user)}
                    className="flex items-center gap-3 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                  >
                    <UserAvatar
                      firstName={user.firstName}
                      lastName={user.lastName}
                      username={user.username}
                    />

                    <span>
                      <span className="block font-medium text-slate-900">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="block text-xs text-slate-500">
                        @{user.username}
                      </span>
                    </span>
                  </button>
                </TableCell>

                <TableCell>
                  <p className="text-sm text-slate-700">{user.email || "—"}</p>
                  <p className="text-xs text-slate-500">
                    {user.phone || "No phone"}
                  </p>
                </TableCell>

                <TableCell>
                  <RoleList user={user} />
                </TableCell>

                <TableCell>
                  <UserStatusBadge status={user.status} />
                </TableCell>

                <TableCell>
                  <RowActions user={user} {...actions} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => actions.onView(user)}
                className="flex min-w-0 items-center gap-3 text-left"
              >
                <UserAvatar
                  firstName={user.firstName}
                  lastName={user.lastName}
                  username={user.username}
                />

                <span className="min-w-0">
                  <span className="block truncate font-medium text-slate-900">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    @{user.username}
                  </span>
                </span>
              </button>

              <UserStatusBadge status={user.status} />
            </div>

            <div className="mt-3 space-y-0.5 text-sm text-slate-600">
              <p className="truncate">{user.email || "—"}</p>
              <p className="text-xs text-slate-500">
                {user.phone || "No phone"}
              </p>
            </div>

            <div className="mt-3">
              <RoleList user={user} />
            </div>

            <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
              <RowActions user={user} {...actions} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Roles                                                                      */
/* -------------------------------------------------------------------------- */

function RoleList({ user }: { user: UserResponse }) {
  if (user.roles.length === 0) {
    return <span className="text-xs text-slate-400">No roles</span>;
  }

  const extra = user.roles.slice(2);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {user.roles.slice(0, 2).map((role) => (
        <UserRoleBadge key={role.id} role={role} />
      ))}

      {extra.length > 0 && (
        <span
          title={extra.map((role) => role.name).join(", ")}
          className="text-xs font-medium text-slate-500"
        >
          +{extra.length}
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Row actions                                                                */
/* -------------------------------------------------------------------------- */

function RowActions({ user, ...actions }: UserActions & { user: UserResponse }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<CSSProperties>({});

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }

    const rect = triggerRef.current?.getBoundingClientRect();

    if (rect) {
      const openUp = window.innerHeight - rect.bottom < 320;

      setPosition({
        position: "fixed",
        right: window.innerWidth - rect.right,
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
      });
    }

    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const close = () => setOpen(false);

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const run = (fn: (user: UserResponse) => void) => () => {
    setOpen(false);
    fn(user);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        title="View details"
        aria-label={`View ${user.username}`}
        onClick={() => actions.onView(user)}
      >
        <Eye size={16} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        title="Edit user"
        aria-label={`Edit ${user.username}`}
        onClick={() => actions.onEdit(user)}
      >
        <Edit size={16} />
      </Button>

      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`More actions for ${user.username}`}
        title="More actions"
        onClick={toggle}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-lg leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
      >
        ⋯
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          style={position}
          className="z-50 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <MenuItem
            icon={<ShieldCheck size={16} />}
            label="Manage roles"
            onClick={run(actions.onRoles)}
          />

          <MenuItem label="Change password" onClick={run(actions.onChangePassword)} />

          <MenuItem label="Reset password" onClick={run(actions.onResetPassword)} />

          {(isLockable(user) || isUnlockable(user) || isDeactivatable(user)) && (
            <div className="my-1 border-t border-slate-100" />
          )}

          {isLockable(user) && (
            <MenuItem
              icon={<Lock size={16} />}
              label="Lock account"
              onClick={run(actions.onLock)}
            />
          )}

          {isUnlockable(user) && (
            <MenuItem
              icon={<Unlock size={16} />}
              label="Unlock account"
              onClick={run(actions.onUnlock)}
            />
          )}

          {isDeactivatable(user) && (
            <MenuItem
              icon={<UserX size={16} />}
              label="Deactivate"
              danger
              onClick={run(actions.onDeactivate)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  danger = false,
  onClick,
}: {
  icon?: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition",
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      <span className="flex h-4 w-4 items-center justify-center">{icon}</span>
      {label}
    </button>
  );
}

/*
 * =========================================================
 * ACTION RULES
 * =========================================================
 *
 * Change the status names here if your backend enum uses
 * different values.
 */

function isLockable(user: UserResponse) {
  return user.status === "ACTIVE";
}

function isUnlockable(user: UserResponse) {
  return user.status === "LOCKED";
}

function isDeactivatable(user: UserResponse) {
  return user.status === "ACTIVE" || user.status === "LOCKED";
}