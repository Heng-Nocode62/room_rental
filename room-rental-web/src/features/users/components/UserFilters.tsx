import { Button, Input, Select } from "../../../components/ui";

import type { RoleResponse, UserStatus } from "../types/user";

interface Props {
  keyword: string;

  status: UserStatus | "";

  roleId: string;

  roles: RoleResponse[];

  onKeywordChange: (value: string) => void;

  onStatusChange: (value: UserStatus | "") => void;

  onRoleChange: (value: string) => void;

  onClear?: () => void;

  /** e.g. "42 users" – shown next to the clear button */
  resultLabel?: string;
}

export function UserFilters({
  keyword,
  status,
  roleId,
  roles,
  onKeywordChange,
  onStatusChange,
  onRoleChange,
  onClear,
  resultLabel,
}: Props) {
  const activeCount = [keyword.trim(), status, roleId].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
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
            { value: "", label: "All statuses" },
            { value: "ACTIVE", label: "Active" },
            { value: "PENDING", label: "Pending" },
            { value: "LOCKED", label: "Locked" },
            { value: "INACTIVE", label: "Inactive" },
          ]}
        />

        <Select
          label="Role"
          value={roleId}
          onChange={(event) => onRoleChange(event.target.value)}
          options={[
            { value: "", label: "All roles" },
            ...roles.map((role) => ({
              value: String(role.id),
              label: role.name,
            })),
          ]}
        />
      </div>

      {(resultLabel || activeCount > 0) && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="text-slate-500">{resultLabel}</p>

          {activeCount > 0 && onClear && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear filters ({activeCount})
            </Button>
          )}
        </div>
      )}
    </div>
  );
}