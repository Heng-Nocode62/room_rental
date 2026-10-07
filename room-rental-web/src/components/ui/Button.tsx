import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "soft"
  | "danger"
  | "ghost"
  | "success"
  | "warning"
  | "link"
  | "view";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 focus-visible:ring-indigo-400",
  secondary:
    "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-300",
  soft: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus-visible:ring-indigo-300",
  danger:
    "bg-rose-600 text-white shadow-sm shadow-rose-600/20 hover:bg-rose-700 focus-visible:ring-rose-300",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300",
  success:
    "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 focus-visible:ring-emerald-300",
  warning:
    "bg-amber-500 text-white shadow-sm shadow-amber-500/20 hover:bg-amber-600 focus-visible:ring-amber-300",
  link: "bg-transparent px-0 text-indigo-600 hover:text-indigo-700 hover:underline focus-visible:ring-0",
  //edit later
  view: "bg- px-0 text-indigo-600 hover:text-indigo-700 hover:underline focus-visible:ring-0",
};

const sizes: Record<ButtonSize, string> = {
  xs: "min-h-8 rounded-md px-2.5 text-xs",
  sm: "min-h-9 rounded-lg px-3 text-sm",
  md: "min-h-10 rounded-lg px-4 text-sm",
  lg: "min-h-11 rounded-xl px-5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition outline-none",
        "focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}
const spinnerSizes: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-4",
};
export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      aria-label="Loading"
      role="status"
      className={cn(
        "inline-block animate-spin rounded-full border-slate-300 border-t-indigo-600",
        spinnerSizes[size],
        className,
      )}
    />
  );
}
