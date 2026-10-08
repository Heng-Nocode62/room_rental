import { useState } from "react";
import { Plus, Sparkles } from "../../../components/ui/MaterialIcon.tsx";

import {
  Button,
  EmptyState,
  LoadingState,
  Modal,
  PageHeader,
  QuickViewDialog,
} from "../../../components/ui/index.ts";

import { useRoomTypes } from "../../room-types/hooks/useRoomTypes.ts";
import { useCreateRoomType } from "../../room-types/hooks/useCreateRoomType.ts";
import { useUpdateRoomType } from "../../room-types/hooks/useUpdateRoomType.ts";
import { useDeactivateRoomType } from "../../room-types/hooks/useDeactivateRoomType.ts";
import { useUpdateRoomTypeImage } from "../../room-types/hooks/useUpdateRoomTypeImage.ts";

import {
  AdminRoomTypeForm,
  type AdminRoomTypeFormValues,
} from "../components/room-types/AdminRoomTypeForm.tsx";

import { RoomTypeTable } from "../../room-types/components/RoomTypeTable";

import type { RoomTypeResponse } from "../../room-types/types/roomType.ts";

import { useTranslation } from "react-i18next";
import { RoomTypeDetailDialog } from "../../room-types/components/RoomTypeDetailDialog.tsx";

export default function AdminRoomTypesPage() {
  const { t } = useTranslation();

  const { data: roomTypes, isLoading, isError, refetch } = useRoomTypes();

  const create = useCreateRoomType();
  const update = useUpdateRoomType();
  const deactivate = useDeactivateRoomType();
  const updateImage = useUpdateRoomTypeImage();

  const [mode, setMode] = useState<"create" | "edit" | null>(null);

  const [selected, setSelected] = useState<RoomTypeResponse | null>(null);

  const [view, setView] = useState<RoomTypeResponse | null>(null);

  const close = () => {
    setMode(null);
    setSelected(null);
  };

  const submit = async (v: AdminRoomTypeFormValues) => {
    const req = {
      name: v.name.trim(),

      description: v.description.trim() || undefined,

      capacity: v.capacity === "" ? undefined : v.capacity,
    };

    try {
      /*
       * ==========================================
       * EDIT
       * ==========================================
       */

      if (mode === "edit" && selected) {
        await update.mutateAsync({
          id: selected.id,
          request: req,
        });

        /*
         * Upload a new image only when the user
         * selected one.
         */
        if (v.image) {
          await updateImage.mutateAsync({
            id: selected.id,
            image: v.image,
          });
        }

        close();
        return;
      }

      /*
       * ==========================================
       * CREATE
       * ==========================================
       */

      const created = await create.mutateAsync({
        name: req.name,
        code: v.code.trim(),
        ...req,
      });

      /*
       * The room type must exist first so we have
       * its ID for the image endpoint.
       */
      if (v.image) {
        await updateImage.mutateAsync({
          id: created.id,
          image: v.image,
        });
      }

      close();
    } catch (error) {
      /*
       * React Query mutation errors are already
       * stored on the individual mutation objects.
       *
       * We intentionally do not close the dialog
       * when something fails so the user can retry.
       */
      console.error("Unable to save room type:", error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-350 space-y-6">
      {/* =====================================================
          PAGE HEADER
         ===================================================== */}

      <PageHeader
        icon={<Sparkles size={19} />}
        title={t("roomTypes")}
        actions={
          <Button
            leftIcon={<Plus size={17} />}
            onClick={() => {
              setSelected(null);
              setMode("create");
            }}
          >
            Add room type
          </Button>
        }
      />

      {/* =====================================================
          LOADING
         ===================================================== */}

      {isLoading && <LoadingState />}

      {/* =====================================================
          ERROR
         ===================================================== */}

      {isError && (
        <EmptyState
          title="Unable to load room types"
          description="Something went wrong while loading room types."
          action={
            <Button variant="secondary" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      )}

      {/* =====================================================
          TABLE
         ===================================================== */}

      {!isLoading && !isError && !!roomTypes?.length && (
        <RoomTypeTable
          roomTypes={roomTypes}
          onView={setView}
          onEdit={(item) => {
            setSelected(item);
            setMode("edit");
          }}
          onToggle={(item) => {
            if (item.status === "ACTIVE") {
              void deactivate.mutateAsync(item.id);
            }
          }}
        />
      )}

      {/* =====================================================
          EMPTY STATE
         ===================================================== */}

      {!isLoading && !isError && roomTypes?.length === 0 && (
        <EmptyState
          title="No room types yet"
          description="Create a room type before you add rooms."
          action={
            <Button
              onClick={() => {
                setSelected(null);
                setMode("create");
              }}
            >
              Add room type
            </Button>
          }
        />
      )}

      {/* =====================================================
          CREATE / EDIT MODAL
         ===================================================== */}

      <Modal
        open={mode !== null}
        onClose={close}
        title={mode === "edit" ? "Edit room type" : "Add room type"}
        description={
          mode === "edit"
            ? "Update the room type information and optionally replace its image."
            : "Create a room type and optionally upload an image."
        }
      >
        <AdminRoomTypeForm
          key={`${mode}-${selected?.id ?? "new"}`}
          mode={mode || "create"}
          initialValues={
            selected
              ? {
                  name: selected.name,
                  code: selected.code,
                  description: selected.description ?? "",
                  capacity: selected.capacity ?? "",
                  imageUrl: selected.imageUrl,
                }
              : undefined
          }
          onSubmit={submit}
          loading={
            create.isPending || update.isPending || updateImage.isPending
          }
        />

        {/* Create error */}

        {create.isError && (
          <p className="mt-3 text-sm text-rose-600">
            Unable to create the room type.
          </p>
        )}

        {/* Update error */}

        {update.isError && (
          <p className="mt-3 text-sm text-rose-600">
            Unable to update the room type.
          </p>
        )}

        {/* Image error */}

        {updateImage.isError && (
          <p className="mt-3 text-sm text-rose-600">
            The room type was saved, but the image could not be uploaded.
          </p>
        )}
      </Modal>

      {/* =====================================================
          QUICK VIEW
         ===================================================== */}

      <RoomTypeDetailDialog
        open={!!view}
        onClose={() => setView(null)}
        roomType={view}
      />
    </div>
  );
}
