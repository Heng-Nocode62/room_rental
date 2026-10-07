import type { TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  requiredMark?: boolean;
}

export function Textarea({
  id,
  label,
  error,
  hint,
  requiredMark = false,
  className,
  ...props
}: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
          {requiredMark && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        className={cn(
          "min-h-28 w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900",
          "placeholder:text-slate-400 outline-none transition",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-100",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
          className,
        )}
        {...props}
      />

      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
