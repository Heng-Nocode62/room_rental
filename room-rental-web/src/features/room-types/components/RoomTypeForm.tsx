import { useForm } from "react-hook-form";

import { Button, Input, Textarea } from "../../../components/ui";

export interface RoomTypeFormValues {
  name: string;
  code: string;
  description: string;
  capacity: number | "";
}

interface RoomTypeFormProps {
  mode: "create" | "edit";

  initialValues?: Partial<RoomTypeFormValues>;

  loading?: boolean;

  onSubmit: (values: RoomTypeFormValues) => Promise<void>;
}

export function RoomTypeForm({
  mode,
  initialValues,
  loading = false,
  onSubmit,
}: RoomTypeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoomTypeFormValues>({
    defaultValues: {
      name: initialValues?.name ?? "",

      code: initialValues?.code ?? "",

      description: initialValues?.description ?? "",

      capacity: initialValues?.capacity ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Name"
        requiredMark
        placeholder="Meeting Room"
        error={errors.name?.message}
        {...register("name", {
          required: "Room type name is required",

          maxLength: {
            value: 100,
            message: "Maximum 100 characters",
          },
        })}
      />

      <Input
        label="Code"
        requiredMark
        placeholder="MEETING"
        disabled={mode === "edit"}
        hint={mode === "edit" ? "Room type code cannot be changed." : undefined}
        error={errors.code?.message}
        {...register("code", {
          required: "Room type code is required",

          maxLength: {
            value: 50,
            message: "Maximum 50 characters",
          },
        })}
      />

      <Input
        label="Capacity"
        type="number"
        min={1}
        placeholder="10"
        error={errors.capacity?.message}
        {...register("capacity", {
          setValueAs: (value) => (value === "" ? "" : Number(value)),

          min: {
            value: 1,
            message: "Capacity must be at least 1",
          },
        })}
      />

      <Textarea
        label="Description"
        placeholder="Suitable for team meetings..."
        {...register("description")}
      />

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          {mode === "create" ? "Create Room Type" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
