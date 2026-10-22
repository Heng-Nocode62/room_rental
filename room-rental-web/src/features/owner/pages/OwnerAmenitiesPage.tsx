import { useEffect, useMemo, useState } from "react";
import { Plus, RotateCcw, Tag } from "../../../components/ui/MaterialIcon.tsx";

import {
  Button,
  EmptyState,
  Input,
  LoadingState,
  Modal,
  PageHeader,
  QuickViewDialog,
  Select,
} from "../../../components/ui/index.ts";

import { useAmenities } from "../../amenities/hooks/useAmenities.ts";
import { useCreateAmenity } from "../../amenities/hooks/useCreateAmenity.ts";
import { useDeactivateAmenity } from "../../amenities/hooks/useDeactivateAmenity.ts";
import { useUpdateAmenity } from "../../amenities/hooks/useUpdateAmenity.ts";
import {
  OwnerAmenityForm,
  type OwnerAmenityFormValues,
  type LocationOption,
} from "../components/amenities/OwnerAmenityForm.tsx";
import { AmenityTable } from "../../amenities/components/AmenityTable";
import type { AmenityListParams, AmenityResponse } from "../../amenities/types/amenity.ts";
import { useLocationScope } from "../../location-scope/LocationScopeProvider.tsx";

interface FilterState {
  name: string;
  status: string;
  minPrice: string;
  maxPrice: string;
  minStock: string;
  maxStock: string;
}

const initialFilters: FilterState = {
  name: "",
  status: "",
  minPrice: "",
  maxPrice: "",
  minStock: "",
  maxStock: "",
};

interface LocationRecord {
  id: number;
  name: string;
}

function normalizeLocations(data: unknown): LocationRecord[] {
  if (Array.isArray(data)) {
    return data.filter(
      (item): item is LocationRecord =>
        !!item &&
        typeof item === "object" &&
        typeof (item as { id?: unknown }).id === "number" &&
        typeof (item as { name?: unknown }).name === "string",
    );
  }

  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as { content?: unknown }).content)
  ) {
    return normalizeLocations((data as { content: unknown[] }).content);
  }

  return [];
}

export default function AmenitiesPage() {
  const scope = useLocationScope();
  const locationsQuery = { data: scope.locations, isLoading: scope.isLoading };
  const locationOptions: LocationOption[] = useMemo(
    () => normalizeLocations(locationsQuery.data),
    [locationsQuery.data],
  );

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [debouncedFilters, setDebouncedFilters] =
    useState<FilterState>(initialFilters);
  const [currentPage, setCurrentPage] = useState(0);
  const size = 10;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedFilters(filters);
      setCurrentPage(0);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [filters]);

  const appliedFilters = useMemo<AmenityListParams>(
  () => ({
    locationId: scope.currentLocationId ?? undefined,

    name: debouncedFilters.name.trim() || undefined,

    status: debouncedFilters.status || undefined,

    minPrice:
      debouncedFilters.minPrice === ""
        ? undefined
        : Number(debouncedFilters.minPrice),

    maxPrice:
      debouncedFilters.maxPrice === ""
        ? undefined
        : Number(debouncedFilters.maxPrice),

    minStock:
      debouncedFilters.minStock === ""
        ? undefined
        : Number(debouncedFilters.minStock),

    maxStock:
      debouncedFilters.maxStock === ""
        ? undefined
        : Number(debouncedFilters.maxStock),

    page: currentPage,
    size,
    sort: "id,desc",
  }),
  [
    debouncedFilters,
    currentPage,
    scope.currentLocationId,
  ],
);

  const { data, isLoading, isFetching, isError, refetch } =
    useAmenities(appliedFilters);

  const create = useCreateAmenity();
  const update = useUpdateAmenity();
  const deactivate = useDeactivateAmenity();

  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<AmenityResponse | null>(null);
  const [view, setView] = useState<AmenityResponse | null>(null);

  const closeFormDialog = () => {
    setMode(null);
    setSelected(null);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setDebouncedFilters(initialFilters);
    setCurrentPage(0);
  };

  const submit = async (values: OwnerAmenityFormValues) => {
    if (mode === "edit" && selected) {
      await update.mutateAsync({
        id: selected.id,
        request: {
          name: values.name.trim(),
          description: values.description.trim() || undefined,
          price: values.price,
          stockQuantity: values.stockQuantity,
        },
      });
    } else {
      await create.mutateAsync({
        locationId: scope.currentLocationId!,
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        price: values.price,
        stockQuantity: values.stockQuantity,
      });
    }

    closeFormDialog();
  };

  const handleDeactivate = async (item: AmenityResponse) => {
    const confirmed = window.confirm(`Deactivate "${item.name}"?`);

    if (!confirmed) return;

    await deactivate.mutateAsync(item.id);
  };

  const locationName = (locationId: number) =>
    locationOptions.find((location) => location.id === locationId)?.name ??
    `#${locationId}`;

  const amenities = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const page = data?.number ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <PageHeader
        icon={<Tag size={19} />}
        title="Amenities"
        actions={
          <Button
            leftIcon={<Plus size={17} />}
            onClick={() => setMode("create")}
          >
            Add amenity
          </Button>
        }
      />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Search & Filters
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Results update automatically as you change the filters.
            </p>
          </div>

          {isFetching && !isLoading && (
            <span className="text-xs text-slate-400">Updating...</span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Name"
            placeholder="Search amenity..."
            value={filters.name}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
          />

          <Select
            label="Status"
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: event.target.value,
              }))
            }
            options={[
              { label: "All Status", value: "" },
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
            ]}
          />

          <Input
            label="Min price"
            type="number"
            min={0}
            step="0.01"
            value={filters.minPrice}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                minPrice: event.target.value,
              }))
            }
          />

          <Input
            label="Max price"
            type="number"
            min={0}
            step="0.01"
            value={filters.maxPrice}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                maxPrice: event.target.value,
              }))
            }
          />

          <Input
            label="Min stock"
            type="number"
            min={0}
            value={filters.minStock}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                minStock: event.target.value,
              }))
            }
          />

          <Input
            label="Max stock"
            type="number"
            min={0}
            value={filters.maxStock}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                maxStock: event.target.value,
              }))
            }
          />

          <div className="flex items-end gap-2">
            <Button
              variant="secondary"
              leftIcon={<RotateCcw size={16} />}
              onClick={resetFilters}
            >
              Reset
            </Button>
          </div>
        </div>
      </section>

      {isLoading && <LoadingState />}

      {isError && (
        <EmptyState
          title="Unable to load amenities"
          description="Something went wrong while loading amenities."
          action={
            <Button variant="secondary" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      )}

      {!isLoading && !isError && amenities.length === 0 && (
        <EmptyState
          title="No amenities found"
          description="Try changing your filters or create a new amenity."
          action={
            <Button onClick={() => setMode("create")}>Add amenity</Button>
          }
        />
      )}

      {!isLoading && !isError && amenities.length > 0 && (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <p className="text-sm font-medium text-slate-700">
                {totalElements.toLocaleString()} amenities
              </p>
            </div>

            <div className="overflow-x-auto">
              <AmenityTable
                amenities={amenities}
                locations={locationOptions}
                onView={setView}
                onEdit={(item) => {
                  setSelected(item);
                  setMode("edit");
                }}
                onToggle={handleDeactivate}
              />
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page {page + 1} of {totalPages}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  disabled={page <= 0}
                  onClick={() => setCurrentPage(page - 1)}
                >
                  Previous
                </Button>

                <Button
                  variant="secondary"
                  disabled={page >= totalPages - 1}
                  onClick={() => setCurrentPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        open={mode !== null}
        onClose={closeFormDialog}
        title={mode === "edit" ? "Edit amenity" : "Add amenity"}
        description="Configure the location, price, stock, and basic information."
      >
        <OwnerAmenityForm
          key={`${mode}-${selected?.id ?? "new"}`}
          mode={mode === "edit" ? "edit" : "create"}
          initialValues={
            selected
              ? {
                  locationId: selected.locationId,
                  name: selected.name,
                  description: selected.description ?? "",
                  price: selected.price,
                  stockQuantity: selected.stockQuantity,
                }
              : undefined
          }
          locations={locationOptions}
          loadingLocations={locationsQuery.isLoading}
          fixedLocationId={scope.currentLocationId ?? undefined}
          onSubmit={submit}
          loading={create.isPending || update.isPending}
        />

        {(create.isError || update.isError) && (
          <p className="mt-3 text-sm text-rose-600">
            Unable to save the amenity. Please check the information and try
            again.
          </p>
        )}
      </Modal>

      {view && (
        <QuickViewDialog
          open={!!view}
          onClose={() => setView(null)}
          title={view.name}
          eyebrow={`Amenity #${view.id}`}
          fields={[
            {
              label: "Location",
              value: locationName(view.locationId),
            },
            {
              label: "Status",
              value: view.status,
            },
            {
              label: "Price",
              value: Number(view.price).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
            },
            {
              label: "Stock",
              value: Number(view.stockQuantity).toLocaleString(),
            },
            {
              label: "Description",
              value: view.description || "No description",
              wide: true,
            },
          ]}
        />
      )}
    </div>
  );
}
