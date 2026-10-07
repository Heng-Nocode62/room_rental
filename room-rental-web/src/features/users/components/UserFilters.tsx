import { Input, Select } from "../../../components/ui";

import type { RoleResponse, UserStatus } from "../types/user";

interface Props {
  keyword: string;

  status: UserStatus | "";

  roleId: string;

  roles: RoleResponse[];

  onKeywordChange: (value: string) => void;

  onStatusChange: (value: UserStatus | "") => void;

  onRoleChange: (value: string) => void;
}

export function UserFilters({
  keyword,
  status,
  roleId,
  roles,
  onKeywordChange,
  onStatusChange,
  onRoleChange,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Input
        label="Search"
        placeholder="Username, name, email..."
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
      />

      <Select
        label="Status"
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as UserStatus | "")
        }
        options={[
          {
            value: "",
            label: "All statuses",
          },

          {
            value: "ACTIVE",
            label: "Active",
          },

          {
            value: "LOCKED",
            label: "Locked",
          },

          {
            value: "INACTIVE",
            label: "Inactive",
          },
        ]}
      />

      <Select
        label="Role"
        value={roleId}
        onChange={(event) => onRoleChange(event.target.value)}
        options={[
          {
            value: "",
            label: "All roles",
          },

          ...roles.map((role) => ({
            value: String(role.id),

            label: role.name,
          })),
        ]}
      />
    </div>
  );
}
