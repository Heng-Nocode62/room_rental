import { useForm } from "react-hook-form";
import { Button, Input } from "../../../../components/ui/index.ts";
import type { JsonValue } from "../../../languages/types/translation.ts";

export interface TranslationFormValues {
  key: string;
  value: string;
  active: boolean;
}

interface Props {
  initialValues?: Partial<TranslationFormValues> & { value?: JsonValue };
  loading?: boolean;
  onSubmit: (values: TranslationFormValues) => Promise<void>;
  onCancel?: () => void;
}

function toText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return JSON.stringify(value, null, 2);
}

export function TranslationForm({ initialValues, loading = false, onSubmit, onCancel }: Props) {
  const isEditing = Boolean(initialValues?.key);
  const { register, handleSubmit, formState: { errors } } = useForm<TranslationFormValues>({
    defaultValues: {
      key: initialValues?.key ?? "",
      value: toText(initialValues?.value),
      active: initialValues?.active ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Key" requiredMark placeholder="rooms.title" disabled={isEditing}
        error={errors.key?.message} {...register("key", { required: "Key is required", maxLength: { value: 255, message: "Maximum 255 characters" } })} />
      <Input label="Value" requiredMark placeholder="Rooms" error={errors.value?.message}
        {...register("value", { required: "Value is required" })} />
      <p className="text-xs text-slate-500">Plain text is sent as a JSON string. JSON objects/arrays are also accepted.</p>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register("active")} /> Active
      </label>
      <div className="flex justify-end gap-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" loading={loading}>{isEditing ? "Save" : "Add Translation"}</Button>
      </div>
    </form>
  );
}
