import { Input, Textarea, Button } from "../../../../components/ui";
import { ShieldCheck } from "../../../../components/ui/MaterialIcon";
import type { ModuleResponse } from "../../../module/types/module";


export interface PermissionFormValues {
  code: string;
  name: string;
  description: string;
}

interface PermissionFormProps {
  permission: PermissionFormValues;

  module?: ModuleResponse;

  editMode?: boolean;

  loading?: boolean;

  onChange: (
    field: keyof PermissionFormValues,
    value: string,
  ) => void;

  onCancel: () => void;

  onSubmit: () => void;
}

export function PermissionForm({
  permission,
  module,
  editMode = false,
  loading = false,
  onChange,
  onCancel,
  onSubmit,
}: PermissionFormProps) {
  return (
    <div className="space-y-5">
      {module && (
        <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <ShieldCheck size={23} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              {module.name}
            </p>

            <p className="text-xs text-slate-500">
              This permission will be added to the{" "}
              {module.name} module.
            </p>
          </div>
        </div>
      )}

      <Input
        label="Code"
        requiredMark
        placeholder="e.g. ROOM_VIEW"
        value={permission.code}
        onChange={(event) =>
          onChange(
            "code",
            event.target.value.toUpperCase(),
          )
        }
      />

      <Input
        label="Name"
        requiredMark
        placeholder="e.g. View Rooms"
        value={permission.name}
        onChange={(event) =>
          onChange(
            "name",
            event.target.value,
          )
        }
      />

      <Textarea
        label="Description"
        placeholder="Describe this permission..."
        value={permission.description}
        onChange={(event) =>
          onChange(
            "description",
            event.target.value,
          )
        }
      />

      <div className="flex justify-end gap-3 border-t pt-5">
        <Button
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          loading={loading}
          onClick={onSubmit}
        >
          {editMode
            ? "Save permission"
            : "Create permission"}
        </Button>
      </div>
    </div>
  );
}