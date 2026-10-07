import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import logo from "../../../assets/logo.svg";
/* ---------- Brand ---------- */
export function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {/* <div
        className={`grid h-11 w-11 place-items-center rounded-xl text-sm font-bold shadow-lg ${
          dark ? "bg-white text-slate-950" : "bg-slate-950 text-white"
        }`}
      >
        
      </div> */}
      <img src={logo} alt="RR" width="50px" />
      <div>
        <p className={`font-semibold ${dark ? "text-white" : "text-slate-950"}`}>Room Rental</p>
        <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>Management Portal</p>
      </div>
    </div>
  );
}

/* ---------- Layout ---------- */
interface AuthLayoutProps {
  /** Content of the desktop-only left panel */
  panel: { eyebrow: string; title: string; text: string; extra?: ReactNode; footnote: string };
  /** Tailwind max-width class for the form column */
  maxWidth?: string;
  children: ReactNode;
}

export function AuthLayout({ panel, maxWidth = "max-w-md", children }: AuthLayoutProps) {
  return (
    <div className="min-h-dvh bg-slate-950">
      <div className="mx-auto grid min-h-dvh max-w-7xl lg:grid-cols-[1.05fr_.95fr]">
        {/* Desktop brand panel */}
        <aside className="relative hidden overflow-hidden px-12 py-12 lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative"><Brand dark /></div>
          <div className="relative max-w-xl">
            <p className="mb-4 text-sm font-medium text-indigo-300">{panel.eyebrow}</p>
            <h1 className="text-5xl font-semibold leading-tight tracking-tight text-white xl:text-6xl">{panel.title}</h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">{panel.text}</p>
            {panel.extra}
          </div>
          <p className="relative text-xs text-slate-500">{panel.footnote}</p>
        </aside>

        {/* Form column */}
        <main className="flex min-h-dvh flex-col bg-slate-50 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8">
          <div className={`mx-auto flex w-full flex-1 flex-col justify-center py-4 sm:py-10 ${maxWidth}`}>
            <div className="mb-6 lg:hidden"><Brand /></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 sm:rounded-3xl sm:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- Heading block used inside the card ---------- */
export function AuthHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: ReactNode }) {
  return (
    <div className="mb-6 sm:mb-7">
      <p className="mb-1.5 text-sm font-semibold text-indigo-600">{eyebrow}</p>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
      {text && <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>}
    </div>
  );
}

/* ---------- Alert ---------- */
export function Alert({ type, children }: { type: "success" | "error"; children: ReactNode }) {
  const styles =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-700";
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`mb-5 rounded-xl border px-4 py-3 text-left text-sm leading-5 ${styles}`}
    >
      {children}
    </div>
  );
}


interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
  trailing?: ReactNode;
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField(
  { label, error, hint, trailing, id, className = "", ...props },
  ref,
) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`h-12 w-full rounded-xl border bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
              : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/15"
          } ${trailing ? "pr-16" : ""} ${className}`}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
});

/* ---------- Password field with show/hide ---------- */
interface PasswordFieldProps extends Omit<AuthFieldProps, "type" | "trailing"> {
  visible?: boolean;
  onToggle?: () => void;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
  { visible, onToggle, ...props },
  ref,
) {
  // Works controlled (shared toggle across fields) or uncontrolled
  const [localVisible, setLocalVisible] = useState(false);
  const isVisible = visible ?? localVisible;
  const toggle = onToggle ?? (() => setLocalVisible((v) => !v));

  return (
    <AuthField
      ref={ref}
      type={isVisible ? "text" : "password"}
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      trailing={
        <button
          type="button"
          onClick={toggle}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          className="h-10 rounded-lg px-3 text-sm font-semibold text-slate-500 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {isVisible ? "Hide" : "Show"}
        </button>
      }
      {...props}
    />
  );
});

/* ---------- Shared helper ---------- */
export function getErrorMessage(error: unknown, fallback: string) {
  const data = (error as { response?: { data?: unknown } } | null)?.response?.data;
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const { message, error: detail } = data as { message?: unknown; error?: unknown };
    if (typeof message === "string") return message;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}