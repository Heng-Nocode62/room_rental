interface QuantityStepperProps {
  value: number;
  label: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function QuantityStepper({
  value,
  label,
  min = 1,
  max = Infinity,
  disabled,
  onChange,
}: QuantityStepperProps) {
  const clamp = (n: number) => Math.min(Math.max(min, n), max);

  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-slate-300 bg-white">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
        className="h-9 w-9 text-lg text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
      >
        −
      </button>

      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        min={min}
        max={Number.isFinite(max) ? max : undefined}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const next = Number(event.target.value);
          onChange(clamp(Number.isNaN(next) ? min : next));
        }}
        className="h-9 w-14 border-x border-slate-200 text-center text-sm outline-none disabled:bg-slate-50"
      />

      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
        className="h-9 w-9 text-lg text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}