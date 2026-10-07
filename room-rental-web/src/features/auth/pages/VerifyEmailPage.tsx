import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { useResendOtp } from "../hooks/useResendOtp";
import { useVerifyEmail } from "../hooks/useVerifyEmail";
import { Alert, AuthLayout, getErrorMessage } from "../components/AuthLayout";

const OTP_LENGTH = 6;

/**
 * Six-box one-time-code input.
 * - numeric keypad on phones
 * - paste and SMS/email autofill (one-time-code) fill all boxes
 * - backspace moves back, focus always lands on the next empty box
 */
function OtpInput({
  value,
  onChange,
  disabled,
  invalid,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (i: number) => refs.current[Math.min(Math.max(i, 0), OTP_LENGTH - 1)]?.focus();

  // Focus the first box on mount and again after the code is cleared (e.g. after an error)
  useEffect(() => {
    if (value === "" && !disabled) focus(0);
  }, [value, disabled]);

  const handleChange = (i: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return;
    if (digits.length > 1) {
      // autofill / multi-digit input fills forward from this box
      const next = (value.slice(0, i) + digits).slice(0, OTP_LENGTH);
      onChange(next);
      focus(next.length);
      return;
    }
    // a single digit replaces (or appends to) this box
    const next = (value.slice(0, i) + digits + value.slice(i + 1)).slice(0, OTP_LENGTH);
    onChange(next);
    focus(i + 1);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[i]) {
        onChange(value.slice(0, i) + value.slice(i + 1));
        focus(i);
      } else if (i > 0) {
        onChange(value.slice(0, i - 1) + value.slice(i));
        focus(i - 1);
      }
    } else if (e.key === "ArrowLeft") focus(i - 1);
    else if (e.key === "ArrowRight") focus(i + 1);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!digits) return;
    onChange(digits);
    focus(digits.length);
  };

  return (
    <div className="grid grid-cols-6 gap-2 sm:gap-3" role="group" aria-label="Verification code" onPaste={handlePaste}>
      {Array.from({ length: OTP_LENGTH }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => {
            // never let focus jump past the first empty box
            if (i > value.length) focus(value.length);
            else e.target.select();
          }}
          disabled={disabled}
          inputMode="numeric"
          pattern="\d*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid}
          className={`h-14 w-full min-w-0 rounded-xl border bg-white text-center text-2xl font-semibold text-slate-950 outline-none transition focus:ring-4 disabled:bg-slate-50 disabled:text-slate-400 sm:h-16 ${
            invalid
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
              : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/15"
          }`}
        />
      ))}
    </div>
  );
}

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const email = params.get("email") ?? "";
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendOtp();
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setInterval(() => setCooldown((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const maskedEmail = useMemo(() => {
    const [name, domain] = email.split("@");
    if (!name || !domain) return email;
    return `${name.slice(0, 2)}${"•".repeat(Math.max(1, name.length - 2))}@${domain}`;
  }, [email]);

  const submit = async (code: string) => {
    if (code.length !== OTP_LENGTH || verifyMutation.isPending) return;
    try {
      await verifyMutation.mutateAsync({ email, otp: code });
      navigate("/login?message=" + encodeURIComponent("Email verified successfully. You can sign in now."), {
        replace: true,
      });
    } catch {
      setOtp(""); // clear so the user can retype; OtpInput refocuses the first box
    }
  };

  const handleChange = (next: string) => {
    setOtp(next);
    if (next.length === OTP_LENGTH) void submit(next); // auto-submit when complete
  };

  const resend = async () => {
    if (!email || cooldown > 0) return;
    try {
      await resendMutation.mutateAsync({ email });
      setCooldown(60);
      setOtp("");
    } catch {}
  };

  const panel = {
    eyebrow: "Verify your email",
    title: "Almost there.",
    text: "Enter the 6-digit code we sent to confirm it's really you.",
    footnote: "Codes expire after a short time for your security.",
  };

  if (!email) {
    return (
      <AuthLayout panel={panel}>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-slate-950">Verification link is incomplete</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Please register again so we know which email to verify.
          </p>
          <Link to="/register" className="mt-6 inline-flex h-12 items-center font-semibold text-indigo-600">
            Back to registration
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout panel={panel}>
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
          <span className="text-2xl" aria-hidden="true">✉</span>
        </div>
        <p className="mt-5 text-sm font-semibold text-indigo-600">Verify your email</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Enter your verification code</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
          We sent a 6-digit code to <span className="break-all font-semibold text-slate-700">{maskedEmail}</span>.{" "}
          <Link to="/register" className="whitespace-nowrap font-semibold text-indigo-600">Wrong email?</Link>
        </p>
      </div>

      <div className="mt-6">
        {verifyMutation.isError && (
          <Alert type="error">{getErrorMessage(verifyMutation.error, "The verification code is invalid or expired.")}</Alert>
        )}
        {resendMutation.isSuccess && !verifyMutation.isError && (
          <Alert type="success">A new verification code has been sent.</Alert>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit(otp);
          }}
          className="space-y-5"
        >
          <OtpInput
            value={otp}
            onChange={handleChange}
            disabled={verifyMutation.isPending}
            invalid={verifyMutation.isError && otp === ""}
          />
          <Button
            type="submit"
            loading={verifyMutation.isPending}
            disabled={otp.length !== OTP_LENGTH}
            className="h-12 w-full text-base"
          >
            Verify email
          </Button>
        </form>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5 text-center">
        <p className="text-sm text-slate-500">Didn't receive the code?</p>
        <button
          type="button"
          disabled={cooldown > 0 || resendMutation.isPending}
          onClick={resend}
          className="mt-1 min-h-11 px-3 text-sm font-semibold text-indigo-600 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          {resendMutation.isPending ? "Sending..." : cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend verification code"}
        </button>
        <Link to="/login" className="mt-1 block min-h-11 py-3 text-sm font-medium text-slate-500 hover:text-slate-900">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}