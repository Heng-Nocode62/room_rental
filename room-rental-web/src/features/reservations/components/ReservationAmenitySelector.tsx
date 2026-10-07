import { useMemo, useState } from "react";

import { Minus, Plus } from "../../../components/ui/MaterialIcon.tsx";

import type { AmenityResponse } from "../../amenities/types/amenity";
import type { ReservationAmenityRequest } from "../types/reservation";

interface ReservationAmenitySelectorProps {
  amenities: AmenityResponse[];
  values: ReservationAmenityRequest[];
  loading?: boolean;
  onChange: (values: ReservationAmenityRequest[]) => void;
}

export function ReservationAmenitySelector({
  amenities,
  values,
  loading = false,
  onChange,
}: ReservationAmenitySelectorProps) {
  const [search, setSearch] = useState("");

  const getQuantity = (amenityId: number) =>
    values.find((item) => item.amenityId === amenityId)?.quantity ?? 0;

  const setQuantity = (amenity: AmenityResponse, nextQuantity: number) => {
    const quantity = Math.max(
      0,
      Math.min(amenity.stockQuantity, Math.floor(nextQuantity)),
    );

    const existing = values.find((item) => item.amenityId === amenity.id);

    if (quantity === 0) {
      onChange(values.filter((item) => item.amenityId !== amenity.id));
      return;
    }

    if (existing) {
      onChange(
        values.map((item) =>
          item.amenityId === amenity.id ? { ...item, quantity } : item,
        ),
      );
      return;
    }

    onChange([...values, { amenityId: amenity.id, quantity }]);
  };

  const filteredAmenities = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return amenities;
    }

    return amenities.filter((amenity) =>
      amenity.name.toLowerCase().includes(term),
    );
  }, [amenities, search]);

  const selectedQuantity = values.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const selectedCost = values.reduce((total, item) => {
    const amenity = amenities.find((a) => a.id === item.amenityId);

    return amenity ? total + amenity.price * item.quantity : total;
  }, 0);

  if (loading) {
    return (
      <div className="rounded-lg border border-[#dadce0] bg-slate-50 px-3 py-2">
        <p className="text-sm text-slate-500">Loading amenities…</p>
      </div>
    );
  }

  if (amenities.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#dadce0] bg-slate-50 px-3 py-3">
        <p className="text-sm text-slate-500">
          No active amenities with available stock at this location.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* SEARCH */}

      <div className="relative">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        >
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M13.5 13.5 17 17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search amenities…"
          className="h-8 w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* LIST */}

      <div className="max-h-56 space-y-1 overflow-y-auto scrollbar-custom pr-1">
        {filteredAmenities.length === 0 && (
          <p className="px-1 py-2 text-sm text-slate-500">
            No amenities match “{search}”.
          </p>
        )}

        {filteredAmenities.map((amenity) => {
          const quantity = getQuantity(amenity.id);
          const selected = quantity > 0;

          return (
            <div
              key={amenity.id}
              className={[
                "flex items-center justify-between gap-3 rounded-lg border px-2.5 py-1.5 transition",
                selected
                  ? "border-indigo-200 bg-indigo-50/50"
                  : "border-transparent hover:border-slate-200",
              ].join(" ")}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {amenity.name}
                </p>

                <p className="text-xs text-slate-500">
                  {Number(amenity.price).toFixed(2)} · {amenity.stockQuantity}{" "}
                  in stock
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  disabled={quantity === 0}
                  onClick={() => setQuantity(amenity, quantity - 1)}
                  aria-label={`Decrease ${amenity.name} quantity`}
                  className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 transition hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <Minus size={12} />
                </button>

                <span className="w-5 text-center text-sm font-semibold text-slate-800">
                  {quantity}
                </span>

                <button
                  type="button"
                  disabled={quantity >= amenity.stockQuantity}
                  onClick={() => setQuantity(amenity, quantity + 1)}
                  aria-label={`Increase ${amenity.name} quantity`}
                  className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 transition hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SUMMARY */}

      {values.length > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-1.5">
          <p className="text-xs font-medium text-indigo-700">
            {selectedQuantity} {selectedQuantity === 1 ? "item" : "items"}{" "}
            selected
          </p>

          <p className="text-xs font-semibold text-indigo-700">
            {selectedCost.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}