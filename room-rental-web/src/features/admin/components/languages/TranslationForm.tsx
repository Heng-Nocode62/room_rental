import { useForm } from "react-hook-form";
import { Button, Input } from "../../../../components/ui/index.ts";
import type { JsonValue } from "../../../languages/types/translation.ts";

export interface TranslationFormValues {
  key: string;
  value: string;
  active: boolean;
}

interface Props {
  initialValues?: Omit<Partial<TranslationFormValues>, "value"> & { value?: JsonValue };
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Key"
        requiredMark
        placeholder="rooms.title"
        disabled={isEditing}
        hint={isEditing ? "The key can't be changed after it is created." : "Use dot notation, e.g. rooms.title"}
        error={errors.key?.message}
        {...register("key", { required: "Key is required", maxLength: { value: 255, message: "Maximum 255 characters" } })}
      />
      <div className="space-y-1.5">
        <label htmlFor="translation-value" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Value <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="translation-value"
          rows={5}
          placeholder="Rooms"
          aria-invalid={Boolean(errors.value)}
          className={`block w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-slate-100 ${
            errors.value
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
              : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-200 dark:border-slate-700 dark:focus:ring-indigo-900"
          }`}
          {...register("value", { required: "Value is required" })}
        />
        {errors.value ? (
          <p className="text-xs text-rose-600">{errors.value.message}</p>
        ) : (
          <p className="text-xs text-slate-500">
            Plain text is sent as a JSON string. JSON objects and arrays are also accepted.
          </p>
        )}
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600" {...register("active")} />
        Active
      </label>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {isEditing ? "Save" : "Add Translation"}
        </Button>
      </div>
    </form>
  );
}