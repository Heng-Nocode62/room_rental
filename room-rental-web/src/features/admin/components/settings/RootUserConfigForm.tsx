import { useForm } from "react-hook-form";

import { Button, Input } from "../../../../components/ui";

import type { RootUserConfig } from "../../../settings/types/config";

interface Props {
  initialValues?: Partial<RootUserConfig>;
  loading?: boolean;
  onSubmit: (values: RootUserConfig) => Promise<void>;
}

export function RootUserConfigForm({ initialValues, loading = false, onSubmit }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<RootUserConfig>({
    defaultValues: {
      username: initialValues?.username ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Root username"
        requiredMark
        placeholder="staff"
        error={errors.username?.message}
        {...register("username", { required: "Username is required" })}
      />

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
