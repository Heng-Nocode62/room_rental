
export function AvailabilityLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">

      <LegendItem
        className="bg-emerald-100"
        label="Available"
      />

      <LegendItem
        className="bg-red-100"
        label="Reserved"
      />

      <LegendItem
        className="bg-amber-100"
        label="Blocked"
      />

    </div>
  );
}


function LegendItem({
  className,
  label,
}: {
  className: string;
  label: string;
}) {

  return (
    <div className="flex items-center gap-2">

      <span
        className={`h-3 w-3 rounded-sm ${className}`}
      />

      <span>
        {label}
      </span>

    </div>
  );
}