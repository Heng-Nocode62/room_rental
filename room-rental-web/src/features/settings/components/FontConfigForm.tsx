import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "../../../components/ui";

import type { AppFontConfig } from "../types/config";

interface Props {
  initialValues?: Partial<AppFontConfig>;
  loading?: boolean;
  onSubmit: (values: AppFontConfig) => Promise<void>;
}

export function FontConfigForm({ initialValues, loading = false, onSubmit }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppFontConfig>({
    defaultValues: {
      fonts: initialValues?.fonts ?? [],
      active: initialValues?.active ?? 1,
    },
  });

  useEffect(() => {
    reset({
      fonts: initialValues?.fonts ?? [],
      active: initialValues?.active ?? 1,
    });
  }, [initialValues, reset]);

  const fonts = initialValues?.fonts ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Active font
        </label>
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
          {...register("active", {
            required: "Font is required",
            valueAsNumber: true,
            validate: (value) => fonts.some((font) => font.id === value) || "Select a supported font",
          })}
        >
          {fonts.map((font) => (
            <option key={font.id} value={font.id}>
              {font.name}
            </option>
          ))}
        </select>
        {errors.active?.message && (
          <p className="mt-1 text-xs text-red-600">{errors.active.message}</p>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="mb-3 text-sm font-medium text-slate-700">Supported fonts</p>
        <div className="space-y-2">
          {fonts.length === 0 && (
            <p className="text-sm text-slate-500">No font options were returned by the backend.</p>
          )}
          {fonts.map((font) => (
            <div key={font.id} className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm">
              <span>{font.name}</span>
              <span className="text-xs text-slate-400">ID {font.id}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={loading} disabled={fonts.length === 0}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
