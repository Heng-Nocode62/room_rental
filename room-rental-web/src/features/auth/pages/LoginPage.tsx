import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import GoogleAuthButton from "../../../components/ui/GoogleAuthButton";
import { useGoogleLogin } from "../hooks/useGoogleLogin";
import { useLogin } from "../hooks/useLogin";
import {
  Alert,
  AuthField,
  AuthHeading,
  AuthLayout,
  PasswordField,
  getErrorMessage,
} from "../components/AuthLayout";

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();
  const [message] = useState(() =>
    new URLSearchParams(location.search).get("message"),
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async ({ email, password }: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync({ email, password });
      navigate("/app", { replace: true });
    } catch {}
  };

  const handleGoogleAuth = async (credential: string) => {
    try {
      await googleLoginMutation.mutateAsync(credential);
      navigate("/app", { replace: true });
    } catch {}
  };

  const busy = loginMutation.isPending || googleLoginMutation.isPending;

  return (
    <AuthLayout
      panel={{
        eyebrow: "Staff workspace",
        title: "Manage every room with confidence.",
        text: "Reservations, availability, amenities, and daily operations in one secure workspace.",
        footnote: "Secure staff access • Room Rental Management System",
      }}
    >
      <AuthHeading
        eyebrow="Welcome back"
        title="Sign in to your account"
        text="Use your email and password to continue."
      />

      {message && <Alert type="success">{message}</Alert>}
      {loginMutation.isError && (
        <Alert type="error">
          {getErrorMessage(
            loginMutation.error,
            "Unable to sign in. Please check your email and password.",
          )}
        </Alert>
      )}
      {googleLoginMutation.isError && (
        <Alert type="error">
          {getErrorMessage(
            googleLoginMutation.error,
            "Google sign-in failed. Please try again.",
          )}
        </Alert>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 sm:space-y-5"
        noValidate
      >
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
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          })}
        />

        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          enterKeyHint="go"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register("password", { required: "Password is required" })}
        />

        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            {...register("remember")}
          />
          Remember me
        </label>

        <Button type="submit" loading={busy} className="h-12 w-full text-base">
          Sign in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs font-medium text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        <span>or continue with</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="flex justify-center [&>*]:max-w-full">
        <GoogleAuthButton onAuth={handleGoogleAuth} />
      </div>

      <p className="mt-7 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="inline-block py-1 font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Create one
        </Link>
      </p>
      <div className="-mt-1 flex justify-end">
        <Link
          to="/forgot-password"
          className="py-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Forgot password?
        </Link>
      </div>
    </AuthLayout>
  );
}
