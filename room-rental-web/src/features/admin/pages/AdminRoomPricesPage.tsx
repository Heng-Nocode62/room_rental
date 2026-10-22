import { useState } from "react";
import {
  Plus,
  SlidersHorizontal,
  Tags,
} from "../../../components/ui/MaterialIcon.tsx";
import {
  Button,
  Card,
  EmptyState,
  LoadingState,
  Modal,
  PageHeader,
  Pagination,
} from "../../../components/ui/index.ts";
import { useRooms } from "../../rooms/hooks/useRooms.ts";
import type { RoomResponse } from "../../rooms/types/room.ts";
import { RoomPriceFilters } from "../../pricing/components/RoomPriceFilters";
import { RoomPriceTable } from "../../pricing/components/RoomPriceTable";
import {
  AdminRoomPriceForm,
  type AdminRoomPriceFormValues,
} from "../components/pricing/AdminRoomPriceForm.tsx";
import { RoomPriceStatusBadge } from "../../pricing/components/RoomPriceStatusBadge";
import { pricingUnitOptions } from "../../pricing/config/pricingUnits.ts";
import { useRoomPrices } from "../../pricing/hooks/useRoomPrices.ts";
import { useCreateRoomPrice } from "../../pricing/hooks/useCreateRoomPrice.ts";
import { useUpdateRoomPrice } from "../../pricing/hooks/useUpdateRoomPrice.ts";
import { useDeactivateRoomPrice } from "../../pricing/hooks/useDeactivateRoomPrice.ts";
import type {
  RoomPriceResponse,
  RoomPriceStatus,
} from "../../pricing/types/roomPrice.ts";

export default function RoomPricesPage() {
  const [roomId, setRoomId] = useState("");
  const [status, setStatus] = useState<RoomPriceStatus | "">("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [page, setPage] = useState(0);
  const [dialog, setDialog] = useState<"create" | "edit" | "view" | null>(null);
  const [selected, setSelected] = useState<RoomPriceResponse | null>(null);

  const {
    data: roomsData,
    isLoading: roomsLoading,
    isError: roomsError,
    refetch: refetchRooms,
  } = useRooms({ page: 0, size: 200, sort: "roomNumber,asc" ,status:"ACTIVE"});
  const rooms: RoomResponse[] = roomsData?.content ?? [];
  const create = useCreateRoomPrice();
  const update = useUpdateRoomPrice();
  const deactivate = useDeactivateRoomPrice();

  const { data, isLoading, isError, refetch } = useRoomPrices({
    roomId: roomId ? Number(roomId) : undefined,
    status: status || undefined,
    effectiveDate: effectiveDate || undefined,
    page,
    size: 20,
    sort: "effectiveFrom,desc",
  });

  const closeDialog = () => {
    setDialog(null);
    setSelected(null);
  };
  const clearFilters = () => {
    setRoomId("");
    setStatus("");
    setEffectiveDate("");
    setPage(0);
  };

  const submit = async (values: AdminRoomPriceFormValues) => {
    if (dialog === "edit" && selected) {
      await update.mutateAsync({
        id: selected.id,
        request: {
          price: Number(values.price),
          currencyCode: values.currencyCode.trim().toUpperCase(),
        },
      });
    } else {
      await create.mutateAsync({
        roomId: Number(values.roomId),
        pricingUnitId: Number(values.pricingUnitId),
        price: Number(values.price),
        currencyCode: values.currencyCode.trim().toUpperCase(),
        effectiveFrom: values.effectiveFrom,
        effectiveTo: values.effectiveTo || undefined,
      });
    }
    closeDialog();
  };

  const handleDeactivate = async (price: RoomPriceResponse) => {
    if (
      !window.confirm(
        `Deactivate the ${price.pricingUnitName} price for room ${price.roomNumber}?`,
      )
    )
      return;
    await deactivate.mutateAsync(price.id);
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <PageHeader
        title="Room Pricing"
        icon={<Tags size={19} />}
        actions={
          <Button
            leftIcon={<Plus size={17} />}
            onClick={() => setDialog("create")}
          >
            Create price
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <SlidersHorizontal size={16} className="text-slate-400" /> Filter
          pricing
        </div>
        <RoomPriceFilters
          rooms={rooms}
          roomId={roomId}
          status={status}
          effectiveDate={effectiveDate}
          onRoomIdChange={(v) => {
            setRoomId(v);
            setPage(0);
          }}
          onStatusChange={(v) => {
            setStatus(v);
            setPage(0);
          }}
          onEffectiveDateChange={(v) => {
            setEffectiveDate(v);
            setPage(0);
          }}
        />
        {(roomId || status || effectiveDate) && (
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        )}
      </Card>

      {isLoading && <LoadingState />}
      {isError && (
        <EmptyState
          title="Unable to load room pricing"
          description="Something went wrong while loading room prices."
          action={
            <Button variant="secondary" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      )}
      {!isLoading && !isError && data?.empty && (
        <EmptyState
          title="No room prices found"
          description="Try changing your filters or create a new room price."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      )}
      {!isLoading && !isError && data && !data.empty && (
        <>
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-800">
                {data.totalElements}
              </span>{" "}
              pricing records
            </p>
          </div>
          <RoomPriceTable
            prices={data.content}
            onView={(price) => {
              setSelected(price);
              setDialog("view");
            }}
            onEdit={(price) => {
              setSelected(price);
              setDialog("edit");
            }}
            onDeactivate={handleDeactivate}
          />
          <Pagination pagination={data} onPageChange={setPage} />
        </>
      )}

      <Modal
        open={dialog === "create" || dialog === "edit"}
        onClose={closeDialog}
        title={dialog === "edit" ? "Edit room price" : "Create room price"}
        description={
          dialog === "edit"
            ? "Update the price and currency for this record."
            : "Set a room, pricing unit, and effective period."
        }
        size="lg"
      >
        {dialog && dialog !== "view" && (
          <>
            {dialog === "create" && pricingUnitOptions.length === 0 ? (
              <EmptyState
                title="Pricing units are not configured"
                description="Configure pricing unit IDs in pricingUnits.ts before creating a price."
              />
            ) : roomsLoading ? (
              <LoadingState />
            ) : roomsError ? (
              <EmptyState
                title="Unable to load rooms"
                description="Room options could not be retrieved from the rooms API."
                action={
                  <Button variant="secondary" onClick={() => refetchRooms()}>
                    Retry
                  </Button>
                }
              />
            ) : (
              <AdminRoomPriceForm
                key={`${dialog}-${selected?.id ?? "new"}`}
                mode={dialog}
                pricingUnits={pricingUnitOptions}
                rooms={rooms}
                initialValues={
                  selected
                    ? {
                        roomId: String(selected.roomId),
                        pricingUnitId: String(selected.pricingUnitId),
                        price: selected.price,
                        currencyCode: selected.currencyCode,
                        effectiveFrom: selected.effectiveFrom,
                        effectiveTo: selected.effectiveTo ?? "",
                      }
                    : undefined
                }
                onSubmit={submit}
                onCancel={closeDialog}
                loading={create.isPending || update.isPending}
              />
            )}
            {(create.isError || update.isError) && (
              <p className="mt-3 text-sm text-rose-600">
                The price could not be saved. Please check the fields and try
                again.
              </p>
            )}
          </>
        )}
      </Modal>

      <Modal
        open={dialog === "view"}
        onClose={closeDialog}
        title={
          selected
            ? `${selected.roomNumber} · ${selected.pricingUnitName}`
            : "Price details"
        }
        description="Review the room price and its effective period."
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-indigo-500">
                  Configured rate
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {selected.price.toFixed(2)}{" "}
                  <span className="text-sm font-semibold text-slate-500">
                    {selected.currencyCode}
                  </span>
                </p>
              </div>
              <RoomPriceStatusBadge status={selected.status} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Room number" value={selected.roomNumber} />
              <Info label="Room ID" value={String(selected.roomId)} />
              <Info
                label="Pricing unit"
                value={`${selected.pricingUnitName} (${selected.pricingUnitCode})`}
              />
              <Info label="Effective from" value={selected.effectiveFrom} />
              <Info
                label="Effective to"
                value={selected.effectiveTo || "No end date"}
              />
              <Info label="Currency" value={selected.currencyCode} />
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button variant="secondary" onClick={closeDialog}>
                Close
              </Button>
              <Button onClick={() => setDialog("edit")}>Edit price</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}
