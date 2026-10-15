import { useEffect, useMemo, useState } from "react";
import { Button, Input, Modal } from "../../../../components/ui";
import type { RoleResponse } from "../../../roles/types/role";
import { useAssignPermissions } from "../../../roles/hooks/roleHooks";
import { usePermissions } from "../../../permissions/hooks/permissionHooks";
import type { PermissionResponse } from "../../../permissions/types/permission";

export default function AdminRolePermissionDialog({ role, open, onClose }: { role: RoleResponse | null; open: boolean; onClose: () => void }) {
  const permissionsQuery = usePermissions();
  const assign = useAssignPermissions();
  const [selected, setSelected] = useState<number[]>([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    setSelected(role?.permissions.map((item: PermissionResponse) => item.id) ?? []);
    setKeyword("");
  }, [role]);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return (permissionsQuery.data ?? []).filter((item: PermissionResponse) => !q || item.code.toLowerCase().includes(q) || item.name.toLowerCase().includes(q));
  }, [permissionsQuery.data, keyword]);

  const toggle = (id: number) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);

  const save = async () => {
    if (!role) return;
    await assign.mutateAsync({ id: role.id, request: { permissionIds: selected } });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={role ? `Permissions · ${role.name}` : "Permissions"} description="Choose the permissions attached to this role." size="lg">
      <div className="space-y-4">
        <Input label="Search permissions" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Search by code or name" />
        <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
          {filtered.map((permission: PermissionResponse) => (
            <label key={permission.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50">
              <input type="checkbox" className="mt-1 h-4 w-4" checked={selected.includes(permission.id)} onChange={() => toggle(permission.id)} />
              <span><span className="block text-sm font-medium text-slate-900">{permission.name}</span><span className="text-xs text-slate-500">{permission.code}</span></span>
            </label>
          ))}
        </div>
        <div className="flex justify-end"><Button onClick={save} loading={assign.isPending}>Save permissions</Button></div>
      </div>
    </Modal>
  );
}
