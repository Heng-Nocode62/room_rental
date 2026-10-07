import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button, Input } from "../../../components/ui";

import type { EditApprovedReportConfig } from "../types/config";

interface Props {
  initialValues?: Partial<EditApprovedReportConfig>;
  loading?: boolean;
  onSubmit: (values: EditApprovedReportConfig) => Promise<void>;
}

export function ApprovalConfigForm({ initialValues, loading = false, onSubmit }: Props) {
  const { register, handleSubmit, watch, reset, formState: { errors } } =
    useForm<EditApprovedReportConfig>({
      defaultValues: {
        enabled: initialValues?.enabled ?? false,
        windowMinutes: initialValues?.windowMinutes ?? 15,
      },
    });

  useEffect(() => {
    reset({
      enabled: initialValues?.enabled ?? false,
      windowMinutes: initialValues?.windowMinutes ?? 15,
    });
  }, [initialValues, reset]);

  const enabled = watch("enabled");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register("enabled")} />
        Allow editing an approved report
      </label>

      <Input
        label="Edit window (minutes)"
        type="number"
        min={1}
        disabled={!enabled}
        error={errors.windowMinutes?.message}
        {...register("windowMinutes", {
          required: "Window is required",
          valueAsNumber: true,
          min: { value: 1, message: "Must be at least 1 minute" },
        })}
      />

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
