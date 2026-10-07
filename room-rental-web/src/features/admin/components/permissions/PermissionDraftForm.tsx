import { Input, Textarea } from "../../../../components/ui";
import { X } from "../../../../components/ui/MaterialIcon";


export interface PermissionDraft {
  code: string;
  name: string;
  description: string;
}

interface PermissionDraftFormProps {
  permission: PermissionDraft;

  onChange: (
    field: keyof PermissionDraft,
    value: string,
  ) => void;

  onRemove: () => void;
}

export function PermissionDraftForm({
  permission,
  onChange,
  onRemove,
}: PermissionDraftFormProps) {
  return (
    <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-700"
      >
        <X size={15} />
      </button>

      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>

      <div className="mt-4">
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
      </div>
    </div>
  );
}