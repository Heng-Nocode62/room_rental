import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button, Input, Textarea } from "../../../components/ui";

export interface RoomTypeFormValues {
  name: string;
  code: string;
  description: string;
  capacity: number | "";

  image: File | null;
}

interface RoomTypeFormProps {
  mode: "create" | "edit";

  initialValues?: Partial<RoomTypeFormValues> & {
    imageUrl?: string;
  };

  loading?: boolean;

  onSubmit: (values: RoomTypeFormValues) => Promise<void>;
}

export function RoomTypeForm({
  mode,
  initialValues,
  loading = false,
  onSubmit,
}: RoomTypeFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialValues?.imageUrl ?? null,
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RoomTypeFormValues>({
    defaultValues: {
      name: initialValues?.name ?? "",

      code: initialValues?.code ?? "",

      description: initialValues?.description ?? "",

      capacity: initialValues?.capacity ?? "",

      image: null,
    },
  });

  useEffect(() => {
    return () => {
      if (
        imagePreview &&
        imagePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;

    setValue("image", file, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (!file) {
      setImagePreview(initialValues?.imageUrl ?? null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImagePreview(initialValues?.imageUrl ?? null);
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
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
        hint={
          mode === "edit"
            ? "Room type code cannot be changed."
            : undefined
        }
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
          setValueAs: (value) =>
            value === "" ? "" : Number(value),

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

      {/* Image */}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Room Type Image
        </label>

        {imagePreview ? (
          <div className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <img
              src={imagePreview}
              alt="Room type preview"
              className="h-48 w-full object-cover"
            />
          </div>
        ) : (
          <div className="mb-3 flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">
                No image selected
              </p>

              <p className="mt-1 text-xs text-slate-400">
                JPG, PNG or WebP
              </p>
            </div>
          </div>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          disabled={loading}
          className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
        />

        <p className="mt-1.5 text-xs text-slate-500">
          Maximum image size: 5 MB.
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          {mode === "create"
            ? "Create Room Type"
            : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}