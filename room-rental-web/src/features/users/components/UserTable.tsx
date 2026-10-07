
import { useNavigate } from "react-router-dom";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../../components/ui";

import type { UserResponse } from "../types/user";

import { UserStatusBadge } from "./UserStatusBadge";

import { UserRoleBadge } from "./UserRoleBadge";

export function UserTable({ users }: { users: UserResponse[] }) {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>User</TableHeaderCell>

          <TableHeaderCell>Contact</TableHeaderCell>

          <TableHeaderCell>Roles</TableHeaderCell>

          <TableHeaderCell>Status</TableHeaderCell>

          <TableHeaderCell className="text-right">Action</TableHeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <p className="font-medium text-slate-900">
                {user.firstName} {user.lastName}
              </p>

              {/* <p className="text-xs text-slate-500">@{user.username}</p> */}
            </TableCell>

            <TableCell>
              <p>{user.email || "—"}</p>

              <p className="text-xs text-slate-500">
                {user.phone || "No phone"}
              </p>
            </TableCell>

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

            <TableCell>
              <UserStatusBadge status={user.status} />
            </TableCell>

            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/users/${user.id}`)}
              >
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
