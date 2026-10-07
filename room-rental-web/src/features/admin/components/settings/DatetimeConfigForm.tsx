import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "../../../../components/ui";

import type { AppDatetimeConfig } from "../../../settings/types/config";

interface Props {
  initialValues?: Partial<AppDatetimeConfig>;
  loading?: boolean;
  onSubmit: (values: AppDatetimeConfig) => Promise<void>;
}

export function DatetimeConfigForm({ initialValues, loading = false, onSubmit }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppDatetimeConfig>({
    defaultValues: {
      formats: initialValues?.formats ?? [],
      active: initialValues?.active ?? 1,
    },
  });

  useEffect(() => {
    reset({
      formats: initialValues?.formats ?? [],
      active: initialValues?.active ?? 1,
    });
  }, [initialValues, reset]);

  const formats = initialValues?.formats ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Active date/time format
        </label>
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
          {...register("active", {
            required: "Date/time format is required",
            valueAsNumber: true,
            validate: (value) => formats.some((format) => format.id === value) || "Select a supported format",
          })}
        >
          {formats.map((format) => (
            <option key={format.id} value={format.id}>
              {format.format}
            </option>
          ))}
        </select>
        {errors.active?.message && (
          <p className="mt-1 text-xs text-red-600">{errors.active.message}</p>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="mb-3 text-sm font-medium text-slate-700">Supported formats</p>
        <div className="space-y-2">
          {formats.length === 0 && (
            <p className="text-sm text-slate-500">No datetime formats were returned by the backend.</p>
          )}
          {formats.map((format) => (
            <div key={format.id} className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm">
              <span>{format.format}</span>
              <span className="text-xs text-slate-400">ID {format.id}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={loading} disabled={formats.length === 0}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
