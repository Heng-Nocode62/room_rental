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

import { UserStatusBadge } from "./UserStatusBadge";
import { UserRoleBadge } from "./UserRoleBadge";

type UserTableProps = {
  users: UserResponse[];

  onView: (user: UserResponse) => void;

  onEdit: (user: UserResponse) => void;

  onRoles: (user: UserResponse) => void;

  onLock: (user: UserResponse) => void;

  onUnlock: (user: UserResponse) => void;

  onDeactivate: (user: UserResponse) => void;
};

export function UserTable({
  users,
  onView,
  onEdit,
  onRoles,
  onLock,
  onUnlock,
  onDeactivate,
}: UserTableProps) {
  return (
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
            {/* User */}

            <TableCell>
              <div>
                <p className="font-medium text-slate-900">
                  {user.firstName} {user.lastName}
                </p>

                <p className="text-xs text-slate-500">@{user.username}</p>
              </div>
            </TableCell>

            {/* Contact */}

            <TableCell>
              <p>{user.email || "—"}</p>

              <p className="text-xs text-slate-500">
                {user.phone || "No phone"}
              </p>
            </TableCell>

            {/* Roles */}

            <TableCell>
              <div className="flex flex-wrap gap-1.5">
                {user.roles.length === 0 ? (
                  <span className="text-xs text-slate-400">No roles</span>
                ) : (
                  user.roles
                    .slice(0, 2)
                    .map((role) => <UserRoleBadge key={role.id} role={role} />)
                )}

                {user.roles.length > 2 && (
                  <span className="text-xs text-slate-400">
                    +{user.roles.length - 2}
                  </span>
                )}
              </div>
            </TableCell>

            {/* Status */}

            <TableCell>
              <UserStatusBadge status={user.status} />
            </TableCell>

            {/* Actions */}

            <TableCell>
              <div className="flex justify-end gap-1">
                {/* View */}

                <Button
                  variant="ghost"
                  size="sm"
                  title="View user"
                  onClick={() => onView(user)}
                >
                  <Eye size={16} />
                </Button>

                {/* Edit */}

                <Button
                  variant="ghost"
                  size="sm"
                  title="Edit user"
                  onClick={() => onEdit(user)}
                >
                  <Edit size={16} />
                </Button>

                {/* Roles */}

                <Button
                  variant="ghost"
                  size="sm"
                  title="Manage roles"
                  onClick={() => onRoles(user)}
                >
                  <ShieldCheck size={16} />
                </Button>

                {/* Lock */}

                {isLockable(user) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Lock user"
                    onClick={() => onLock(user)}
                  >
                    <Lock size={16} />
                  </Button>
                )}

                {/* Unlock */}

                {isUnlockable(user) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Unlock user"
                    onClick={() => onUnlock(user)}
                  >
                    <Unlock size={16} />
                  </Button>
                )}

                {/* Deactivate */}

                {isDeactivatable(user) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Deactivate user"
                    onClick={() => onDeactivate(user)}
                  >
                    <UserX size={16} />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/*
 * =========================================================
 * ACTION RULES
 * =========================================================
 *
 * Keep these rules here so AdminUsersPage does not need
 * to know which buttons should be displayed.
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
