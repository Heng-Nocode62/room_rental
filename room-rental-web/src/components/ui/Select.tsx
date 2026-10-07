import { useId } from "react";
import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "./MaterialIcon.tsx";
import { cn } from "./cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  requiredMark?: boolean;
}

export function Select({
  id,
  label,
  error,
  hint,
  options,
  placeholder,
  requiredMark = false,
  className,
  disabled,
  ...props
}: SelectProps) {
  // Fallback id so label/aria links work even when no id is passed
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    // min-w-0 + max-w-full: lets this shrink inside grid/flex parents
    // instead of being pushed wider by the longest <option>.
    <div className="w-full min-w-0 max-w-full">
      <div className="relative min-w-0">
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              "absolute -top-2.5 left-3 z-10 max-w-[calc(100%-2.5rem)] truncate bg-white px-1.5",
              "text-[13px] font-medium leading-none tracking-tight",
              "transition-colors duration-150",
              disabled
                ? "text-gray-300"
                : error
                  ? "text-red-600"
                  : "text-gray-500",
            )}
          >
            {label}
            {requiredMark && (
              <span
                className={cn("ml-0.5", error ? "text-red-600" : "text-gray-400")}
              >
                *
              </span>
            )}
          </label>
        )}

        <select
          id={selectId}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
          }
          className={cn(
            // block + w-full + min-w-0 + max-w-full: never wider than the column
            // truncate: long option labels get an ellipsis instead of overflowing
            "block w-full min-w-0 max-w-full appearance-none truncate rounded-md border bg-white",
            // 16px on phones stops iOS Safari zooming in on focus; taller tap target
            "px-3.5 py-3 pr-10 text-base text-gray-900 sm:py-2.5 sm:text-[14.5px]",
            "outline-none transition-all duration-150 ease-out",

            !error &&
              !disabled &&
              cn(
                "border-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
                "hover:border-gray-400",
                "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10",
              ),

            error &&
              cn(
                "border-red-400 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
                "focus:border-red-500 focus:ring-4 focus:ring-red-500/10",
              ),

            disabled &&
              "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 shadow-none",

            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2",
            disabled ? "text-gray-300" : "text-gray-400",
          )}
        />
      </div>

      {hint && !error && (
        <p id={`${selectId}-hint`} className="mt-1.5 text-[12.5px] text-gray-500">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={`${selectId}-error`}
          className="mt-1.5 text-[12.5px] font-medium text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}