import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button, Input, Textarea } from "../../../components/ui";

import { useCreateRoomType } from "../../room-types/hooks/useCreateRoomType";
import { useUpdateRoomTypeImage } from "../../room-types/hooks/useUpdateRoomTypeImage";

import { getErrorMessage } from "../utils/roomUtils";

export interface CreatedRoomType {
  id: number;
  name: string;
  locationId?: number;
}

interface FormValues {
  name: string;
  code: string;
  capacity: number | "";
  description: string;
}

interface Props {
  locationId: number;
  locationName: string;
  onCancel: () => void;
  /** `warning` is set when the type was created but its image failed to upload */
  onCreated: (roomType: CreatedRoomType, warning?: string) => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function toCode(name: string) {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}

/**
 * Compact "create room type" panel used inside the room form.
 * It is rendered in place of the room form (not as a second dialog),
 * so the values already typed into the room form are preserved.
 */
export function RoomTypeQuickCreate({
  locationId,
  locationName,
  onCancel,
  onCreated,
}: Props) {
  const create = useCreateRoomType();
  const updateImage = useUpdateRoomTypeImage();

  const [codeEdited, setCodeEdited] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: "", code: "", capacity: "", description: "" },
  });

  const name = watch("name");

  // Suggest a code from the name until the user edits the code themselves.
  useEffect(() => {
    if (!codeEdited) setValue("code", toCode(name ?? ""));
  }, [name, codeEdited, setValue]);

  const previewUrl = useMemo(
    () => (image ? URL.createObjectURL(image) : null),
    [image],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const codeField = register("code", {
    required: "Code is required",
    maxLength: { value: 50, message: "Maximum 50 characters" },
  });

  const pending = create.isPending || updateImage.isPending;

  const submit = handleSubmit(async (values) => {
    setError(null);

    let created;

    try {
      created = await create.mutateAsync({
        name: values.name.trim(),
        code: values.code.trim(),
        locationId,
        description: values.description.trim() || undefined,
        capacity: values.capacity === "" ? undefined : values.capacity,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Unable to create the room type."));
      return;
    }

    let warning: string | undefined;

    if (image) {
      try {
        await updateImage.mutateAsync({ id: created.id, image });
      } catch {
        warning =
          "Room type created, but its image could not be uploaded. You can add it later from Room types.";
      }
    }

    onCreated(
      {
        id: created.id,
        name: values.name.trim(),
        locationId,
      },
      warning,
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          aria-label="Back to room form"
        >
          ←
        </button>

        <div>
          <h3 className="text-base font-semibold text-slate-900">
            New room type
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">
            It will be created in{" "}
            <span className="font-medium text-slate-700">{locationName}</span>{" "}
            and selected for this room.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            requiredMark
            placeholder="Deluxe Room"
            autoFocus
            error={errors.name?.message}
            {...register("name", {
              required: "Room type name is required",
              maxLength: { value: 100, message: "Maximum 100 characters" },
            })}
          />

          <Input
            label="Code"
            requiredMark
            placeholder="DELUXE_ROOM"
            error={errors.code?.message}
            {...codeField}
            onChange={(event) => {
              setCodeEdited(true);
              void codeField.onChange(event);
            }}
          />
        </div>

        <Input
          label="Capacity"
          requiredMark
          type="number"
          min={1}
          step="1"
          placeholder="2"
          error={errors.capacity?.message}
          {...register("capacity", {
            setValueAs: (value) => (value === "" ? "" : Number(value)),
            validate: (value) => {
              if (value === "") return "Capacity is required";
              if (value < 1) return "Capacity must be at least 1";
              if (!Number.isInteger(value)) return "Must be a whole number";
              return true;
            },
          })}
        />

        <Textarea
          label="Description"
          placeholder="Describe this room type..."
          {...register("description", {
            maxLength: { value: 1000, message: "Maximum 1000 characters" },
          })}
        />

        {/* Image */}
        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">
            Image <span className="font-normal text-slate-400">(optional)</span>
          </p>

          {previewUrl ? (
            <div className="relative overflow-hidden rounded-xl border border-slate-200">
              <img
                src={previewUrl}
                alt="Room type preview"
                className="h-40 w-full object-cover"
              />

              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImageError(null);
                }}
                className="absolute right-2 top-2 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 shadow hover:bg-white"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-center transition hover:border-slate-400 hover:bg-slate-50">
              <span className="text-sm font-medium text-slate-700">
                Click to upload an image
              </span>
              <span className="text-xs text-slate-500">
                PNG or JPG, up to 5 MB
              </span>

              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={pending}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;

                  if (file && file.size > MAX_IMAGE_SIZE) {
                    setImage(null);
                    setImageError("Image must be 5 MB or smaller");
                    return;
                  }

                  setImageError(null);
                  setImage(file);
                }}
              />
            </label>
          )}

          {imageError && (
            <p className="mt-1 text-xs text-red-500">{imageError}</p>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={pending}
          >
            Back
          </Button>

          <Button type="submit" loading={pending}>
            Create room type
          </Button>
        </div>
      </form>
    </div>
  );
}