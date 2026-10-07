import { useForm } from "react-hook-form";

import { Button, Input, Textarea } from "../../../components/ui";

export interface RoleFormValues {
  code: string;

  name: string;

  description: string;
}

interface Props {
  mode: "create" | "edit";

  initialValues?: Partial<RoleFormValues>;

  loading?: boolean;

  onSubmit: (values: RoleFormValues) => Promise<void>;
}

export function RoleForm({
  mode,
  initialValues,
  loading = false,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleFormValues>({
    defaultValues: {
      code: initialValues?.code ?? "",

      name: initialValues?.name ?? "",

      description: initialValues?.description ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {mode === "create" && (
        <Input
          label="Role code"
          requiredMark
          placeholder="ROOM_MANAGER"
          error={errors.code?.message}
          {...register("code", {
            required: "Role code is required",
          })}
        />
      )}

      <Input
        label="Role name"
        requiredMark
        placeholder="Room Manager"
        error={errors.name?.message}
        {...register("name", {
          required: "Role name is required",
        })}
      />

      <Textarea
        label="Description"
        placeholder="Manages room configuration and availability."
        {...register("description")}
      />

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          {mode === "create" ? "Create Role" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
