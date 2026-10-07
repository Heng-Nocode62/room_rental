import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button, Input } from "../../../components/ui";

import type { CodeGenerateConfig } from "../types/config";

interface Props {
  initialValues?: Partial<CodeGenerateConfig>;
  loading?: boolean;
  onSubmit: (values: CodeGenerateConfig) => Promise<void>;
}

export function CodeGenerationConfigForm({ initialValues, loading = false, onSubmit }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CodeGenerateConfig>({
    defaultValues: {
      prefix: initialValues?.prefix ?? "",
      resetBy: initialValues?.resetBy ?? "",
      sequenceLength: initialValues?.sequenceLength ?? 4,
    },
  });

  useEffect(() => {
    reset({
      prefix: initialValues?.prefix ?? "",
      resetBy: initialValues?.resetBy ?? "",
      sequenceLength: initialValues?.sequenceLength ?? 4,
    });
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Prefix"
        placeholder="RES-"
        error={errors.prefix?.message}
        {...register("prefix", { required: "Prefix is required" })}
      />

      <Input
        label="Reset by"
        placeholder="day"
        hint="e.g. day, month, year"
        error={errors.resetBy?.message}
        {...register("resetBy", { required: "Reset by is required" })}
      />

      <Input
        label="Sequence length"
        type="number"
        min={1}
        error={errors.sequenceLength?.message}
        {...register("sequenceLength", {
          required: "Sequence length is required",
          valueAsNumber: true,
          min: { value: 1, message: "Must be at least 1" },
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
