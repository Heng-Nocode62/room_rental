import type { RoomPriceResponse } from "../../pricing/types/roomPrice";

interface PricingSelectorProps {
  prices: RoomPriceResponse[];

  selectedPricingUnitId: number | null;

  onSelect: (pricingUnitId: number) => void;
}

/*
 * A small segmented control. There are only ever a couple of pricing
 * units (hourly / daily), so this doesn't need to be a grid of large
 * cards — a compact toggle reads faster and takes far less vertical
 * space in the form.
 */
export function PricingSelector({
  prices,
  selectedPricingUnitId,
  onSelect,
}: PricingSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Reservation type"
      className="inline-flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1"
    >
      {prices.map((price) => {
        const selected = selectedPricingUnitId === price.pricingUnitId;

        return (
          <button
            key={price.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(price.pricingUnitId)}
            className={[
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition",
              "focus:outline-none focus:ring-2 focus:ring-indigo-300",
              selected
                ? "bg-white font-semibold text-slate-900 shadow-sm ring-1 ring-slate-900/10"
                : "font-medium text-slate-500 hover:text-slate-800",
            ].join(" ")}
          >
            <span>{price.pricingUnitName}</span>

            <span
              className={
                selected ? "text-indigo-700" : "text-slate-400"
              }
            >
              {price.price.toFixed(2)} {price.currencyCode}
            </span>
          </button>
        );
      })}
    </div>
  );
}