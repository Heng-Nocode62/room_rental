import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { useRegister } from "../hooks/useRegister";
import type { RegisterRequest } from "../types/auth";
import {
  Alert,
  AuthField,
  AuthHeading,
  AuthLayout,
  PasswordField,
  getErrorMessage,
} from "../components/AuthLayout";

interface RegisterFormValues extends RegisterRequest {
  confirmPassword: string;
}

function strength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}

const STRENGTH_LABEL = ["Too short", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = ["bg-slate-200", "bg-red-400", "bg-amber-400", "bg-lime-500", "bg-emerald-500"];

function Step({ n, label, active = false }: { n: string; label: string; active?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${active ? "border-indigo-400/40 bg-indigo-500/10" : "border-white/10 bg-white/5"}`}>
      <p className="text-xs font-semibold text-indigo-300">{n}</p>
      <p className="mt-2 text-sm font-medium text-white">{label}</p>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
  });

  const password = watch("password");
  const score = password ? strength(password) : 0;

  const onSubmit = async ({ confirmPassword, ...request }: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync(request);
      navigate(`/verify-email?email=${encodeURIComponent(request.email)}`, { replace: true });
    } catch {}
  };

  const toggle = () => setShowPassword((v) => !v);

  return (
    <AuthLayout
      maxWidth="max-w-xl"
      panel={{
        eyebrow: "Create your account",
        title: "Start managing your workspace.",
        text: "Create your account, verify your email, and get ready to work securely.",
        extra: (
          <div className="mt-8 flex gap-3">
            <Step n="01" label="Profile" active />
            <Step n="02" label="Verify" />
            <Step n="03" label="Access" />
          </div>
        ),
        footnote: "Your email will be verified before account access.",
      }}
    >
      <AuthHeading
        eyebrow="New account"
        title="Create your account"
        text="Enter your details. We'll send a verification code to your email."
      />

      {registerMutation.isError && (
        <Alert type="error">
          {getErrorMessage(registerMutation.error, "Unable to create your account. Please check your information.")}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5" noValidate>
        {/* Stacks on phones, 2 columns from sm */}
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          <AuthField
            id="firstName"
            label="First name"
            autoComplete="given-name"
            autoCapitalize="words"
            enterKeyHint="next"
            placeholder="John"
            error={errors.firstName?.message}
            {...register("firstName", { required: "First name is required" })}
          />
          <AuthField
            id="lastName"
            label="Last name"
            autoComplete="family-name"
            autoCapitalize="words"
            enterKeyHint="next"
            placeholder="Doe"
            error={errors.lastName?.message}
            {...register("lastName", { required: "Last name is required" })}
          />
        </div>

        <AuthField
          id="email"
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="next"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
          })}
        />

        <div>
          <PasswordField
            id="password"
            label="Password"
            visible={showPassword}
            onToggle={toggle}
            autoComplete="new-password"
            enterKeyHint="next"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" },
            })}
          />
          {password && (
            <div className="mt-2" aria-live="polite">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${i <= score ? STRENGTH_COLOR[score] : "bg-slate-200"}`}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-slate-500">Password strength: {STRENGTH_LABEL[score]}</p>
            </div>
          )}
        </div>

        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          visible={showPassword}
          onToggle={toggle}
          autoComplete="new-password"
          enterKeyHint="go"
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
        />

        <Button type="submit" loading={registerMutation.isPending} className="h-12 w-full text-base">
          Create account
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="inline-block py-1 font-semibold text-indigo-600 hover:text-indigo-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}