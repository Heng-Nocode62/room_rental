import { useEffect, useMemo, useState } from "react";

import { Button } from "../../../components/ui";

import type { RoleResponse, UserResponse } from "../types/user";

import { useAssignUserRoles } from "../hooks/useAssignUserRoles";

interface Props {
  user: UserResponse;

  roles: RoleResponse[];

  /** Called after roles were saved successfully */
  onSaved?: () => void;

  onCancel?: () => void;
}

export function UserRoleManager({ user, roles, onSaved, onCancel }: Props) {
  const initialIds = useMemo(
    () => user.roles.map((role) => role.id),
    [user.roles],
  );

  const initialKey = [...initialIds].sort((a, b) => a - b).join(",");

  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>(initialIds);
  const [query, setQuery] = useState("");

  // Reset only when the user's assigned roles really change.
  useEffect(() => {
    setSelectedRoleIds(initialIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKey]);

  const mutation = useAssignUserRoles();

  const selectedKey = [...selectedRoleIds].sort((a, b) => a - b).join(",");
  const dirty = selectedKey !== initialKey;
  const empty = selectedRoleIds.length === 0;

  const visibleRoles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roles;

    return roles.filter((role) =>
      [role.name, role.code, role.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [roles, query]);

  const toggleRole = (roleId: number) => {
    setSelectedRoleIds((current) =>
      current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId],
    );
  };

  const saveRoles = async () => {
    // Backend requires at least one role.
    if (empty || !dirty) return;

    try {
      await mutation.mutateAsync({
        id: user.id,
        request: { roleIds: selectedRoleIds },
      });

      onSaved?.();
    } catch {
      // error state is rendered below via mutation.isError
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Roles</h2>

        <p className="mt-1 text-sm text-slate-500">
          Control which areas this staff member can access.
        </p>
      </div>

      {roles.length > 6 && (
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter roles..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      )}

      <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
        {visibleRoles.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">
            No roles match your filter.
          </p>
        )}

        {visibleRoles.map((role) => {
          const selected = selectedRoleIds.includes(role.id);

          return (
            <label
              key={role.id}
              className={[
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition",
                selected
                  ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggleRole(role.id)}
                className="mt-1 h-4 w-4 rounded border-slate-300"
              />

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-slate-900">
                    {role.name}
                  </p>

                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500">
                    {role.code}
                  </span>
                </div>

                {role.description && (
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {role.description}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {empty && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Select at least one role. A user cannot be saved without a role.
        </p>
      )}

      {mutation.isError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Unable to update user roles. Please try again.
        </p>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500">
          {selectedRoleIds.length}{" "}
          {selectedRoleIds.length === 1 ? "role" : "roles"} selected
        </p>

        <div className="flex gap-2">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}

          <Button
            onClick={() => void saveRoles()}
            loading={mutation.isPending}
            disabled={empty || !dirty}
          >
            Save roles
          </Button>
        </div>
      </div>
    </div>
  );
}