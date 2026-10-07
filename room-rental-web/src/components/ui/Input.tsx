import { useState, type InputHTMLAttributes, type FocusEvent, type ChangeEvent } from "react";
import { cn } from "./cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  requiredMark?: boolean;
}

export function Input({
  id,
  label,
  error,
  hint,
  requiredMark = false,
  className,
  disabled,
  value,
  defaultValue,
  placeholder,
  onFocus,
  onBlur,
  onChange,
  ...props
}: InputProps) {
  const hasPlaceholder = Boolean(placeholder);

  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(
    Boolean(value ?? defaultValue ?? ""),
  );

  const isFloated = isFocused || hasValue;

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    onChange?.(e);
  };

  return (
    <div className="w-full">
      <div className="relative">
        {/* Static notched label — only when parent passes a placeholder */}
        {hasPlaceholder && label && (
          <label
            htmlFor={id}
            className={cn(
              "absolute -top-2.5 left-3 z-10 px-1.5 bg-white",
              "text-[13px] font-medium tracking-tight leading-none",
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
              <span className={cn("ml-0.5", error ? "text-red-600" : "text-gray-400")}>
                *
              </span>
            )}
          </label>
        )}

        <input
          id={id}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className={cn(
            "w-full rounded-md border bg-white text-[14.5px] text-gray-900",
            "outline-none transition-all duration-150 ease-out",
            hasPlaceholder ? "px-3.5 py-2.5" : "px-3.5 pt-4 pb-1.5",
            "placeholder:text-gray-400 placeholder:font-normal",

            // default & focus — darker border for definition against white
            !error &&
              !disabled &&
              cn(
                "border-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
                "hover:border-gray-400",
                "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10",
              ),

            // error
            error &&
              cn(
                "border-red-400 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
                "focus:border-red-500 focus:ring-4 focus:ring-red-500/10",
              ),

            // disabled
            disabled &&
              "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 shadow-none",

            className,
          )}
          {...props}
        />

        {/* Floating label as placeholder — only when no placeholder passed */}
        {!hasPlaceholder && label && (
          <label
            htmlFor={id}
            className={cn(
              "pointer-events-none absolute left-3.5 origin-left",
              "transition-all duration-150 ease-out",

              isFloated
                ? cn(
                    "-top-0 left-3 -translate-y-1/2 px-1.5 bg-white",
                    "text-[12px] font-medium",
                    disabled
                      ? "text-gray-300"
                      : error
                      ? "text-red-600"
                      : isFocused
                      ? "text-indigo-600"
                      : "text-gray-600",
                  )
                : cn(
                    "top-1/2 -translate-y-1/2",
                    "text-[14.5px] font-normal",
                    disabled ? "text-gray-300" : "text-gray-400",
                  ),
            )}
          >
            {label}
            {requiredMark && (
              <span className={cn("ml-0.5", error ? "text-red-600" : "text-gray-400")}>
                *
              </span>
            )}
          </label>
        )}
      </div>

      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-[12.5px] text-gray-500">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[12.5px] font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}