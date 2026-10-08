import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

export function cn(
  ...classes: Array<string | false | null | undefined>
) {
  return classes.filter(Boolean).join(" ");
}

type IconName =
  | "home"
  | "search"
  | "calendar"
  | "clock"
  | "map-pin"
  | "user"
  | "sun"
  | "moon"
  | "bell"
  | "menu"
  | "x"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "arrow-right"
  | "users"
  | "building"
  | "wifi"
  | "monitor"
  | "snowflake"
  | "check"
  | "heart"
  | "settings"
  | "lock"
  | "log-out"
  | "phone"
  | "mail"
  | "info"
  | "shield"
  | "eye"
  | "sparkles";

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
  className,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9v11h14V9" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4.5" width="18" height="16" rx="2" />
          <path d="M16 2.5v4M8 2.5v4M3 9h18" />
        </svg>
      );

    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "map-pin":
      return (
        <svg {...common}>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );

    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 21a7 7 0 0 1 14 0" />
        </svg>
      );

    case "sun":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      );

    case "moon":
      return (
        <svg {...common}>
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
        </svg>
      );

    case "bell":
      return (
        <svg {...common}>
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );

    case "x":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );

    case "chevron-down":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );

    case "chevron-left":
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );

    case "chevron-right":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );

    case "arrow-right":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );

    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9.5" cy="7" r="4" />
          <path d="M17 8a4 4 0 0 1 0 7.7M21 21v-2a4 4 0 0 0-3-3.87" />
        </svg>
      );

    case "building":
      return (
        <svg {...common}>
          <path d="M4 21V5l8-3 8 3v16" />
          <path d="M8 21v-4h8v4M8 8h1M15 8h1M8 12h1M15 12h1" />
        </svg>
      );

    case "wifi":
      return (
        <svg {...common}>
          <path d="M5 12.5a10 10 0 0 1 14 0M8 15.5a6 6 0 0 1 8 0M11 18.5a2 2 0 0 1 2 0" />
        </svg>
      );

    case "monitor":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </svg>
      );

    case "snowflake":
      return (
        <svg {...common}>
          <path d="M12 2v20M4.93 5.93l14.14 12.14M19.07 5.93 4.93 18.07M3 12h18" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "heart":
      return (
        <svg {...common}>
          <path d="M20.8 8.6c0 5.5-8.8 10.4-8.8 10.4S3.2 14.1 3.2 8.6A4.6 4.6 0 0 1 12 6.1a4.6 4.6 0 0 1 8.8 2.5Z" />
        </svg>
      );

    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.6h.4A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V4h2.6v.4a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.4V14h-.4a1.7 1.7 0 0 0-1.6 1Z" />
        </svg>
      );

    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );

    case "log-out":
      return (
        <svg {...common}>
          <path d="M10 17l5-5-5-5M15 12H3M21 4v16" />
        </svg>
      );

    case "phone":
      return (
        <svg {...common}>
          <path d="M6 3h3l2 5-2 2a13 13 0 0 0 5 5l2-2 5 2v3a2 2 0 0 1-2 2C10 20 4 14 4 5a2 2 0 0 1 2-2Z" />
        </svg>
      );

    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );

    case "info":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </svg>
      );

    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 20 6v5c0 5-3.2 8.5-8 10-4.8-1.5-8-5-8-10V6l8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "eye":
      return (
        <svg {...common}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );

    case "sparkles":
      return (
        <svg {...common}>
          <path d="m12 3 1.4 5.1L18 10l-4.6 1.9L12 17l-1.4-5.1L6 10l4.6-1.9L12 3Z" />
          <path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" />
        </svg>
      );

    default:
      return null;
  }
}

export function Button({
  children,
  className,
  variant = "primary",
  loading = false,
  leftIcon,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  leftIcon?: ReactNode;
}) {
  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/10",
    secondary:
      "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
    ghost:
      "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700",
  };

  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        leftIcon
      )}
      {children}
    </button>
  );
}

export function Input(
  props: InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
  },
) {
  const { label, error, className, ...inputProps } = props;

  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </span>
      )}

      <input
        {...inputProps}
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.75 text-sm text-slate-900 outline-none transition",
          "placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
          "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400",
          error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10",
          className,
        )}
      />

      {error && (
        <span className="mt-1.5 block text-xs text-rose-600 dark:text-rose-400">
          {error}
        </span>
      )}
    </label>
  );
}

export function SelectInput(
  props: SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
  },
) {
  const { label, className, children, ...selectProps } = props;

  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </span>
      )}

      <div className="relative">
        <select
          {...selectProps}
          className={cn(
            "w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.75 pr-10 text-sm text-slate-900 outline-none",
            "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
            "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400",
            className,
          )}
        >
          {children}
        </select>

        <Icon
          name="chevron-down"
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </label>
  );
}

export function Card({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  if (!open) return null;

  const widths = {
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div
        className={cn(
          "max-h-[92vh] w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950",
          widths[size],
        )}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="max-h-[calc(92vh-100px)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();

  const style =
    normalized === "CONFIRMED"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
      : normalized === "PENDING"
        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
        : normalized === "CANCELLED"
          ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
          : normalized === "COMPLETED"
            ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        style,
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function RoomPlaceholder({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-100 text-blue-500 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 dark:text-blue-400",
        className,
      )}
    >
      <Icon name="building" size={56} strokeWidth={1.4} />
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
    </div>
  );
}

export function Empty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
      <p className="font-semibold text-slate-900 dark:text-white">
        {title}
      </p>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}