import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button, Input } from "../../../components/ui";

import type { AppConfig } from "../types/config";

interface Props {
  initialValues?: Partial<AppConfig>;
  loading?: boolean;
  onSubmit: (values: AppConfig) => Promise<void>;
}

export function AppConfigForm({ initialValues, loading = false, onSubmit }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppConfig>({
    defaultValues: {
      appName: initialValues?.appName ?? "",
      layout: initialValues?.layout ?? "",
      skin: initialValues?.skin ?? "",
    },
  });

  useEffect(() => {
    reset({
      appName: initialValues?.appName ?? "",
      layout: initialValues?.layout ?? "",
      skin: initialValues?.skin ?? "",
    });
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Application name"
        requiredMark
        placeholder="Room Rental"
        error={errors.appName?.message}
        {...register("appName", { required: "Application name is required" })}
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Layout</label>
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
          {...register("layout", { required: "Layout is required" })}
        >
          <option value="vertical">Vertical</option>
          <option value="horizontal">Horizontal</option>
        </select>
        {errors.layout?.message && (
          <p className="mt-1 text-xs text-red-600">{errors.layout.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Skin</label>
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
          {...register("skin", { required: "Skin is required" })}
        >
          <option value="default">Default</option>
          <option value="bordered">Bordered</option>
        </select>
        {errors.skin?.message && (
          <p className="mt-1 text-xs text-red-600">{errors.skin.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
