
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { Button } from "../../../components/ui/Button";
import { authApi } from "../api/authApi";
import {
  Alert,
  AuthField,
  AuthHeading,
  AuthLayout,
  PasswordField,
  getErrorMessage,
} from "../components/AuthLayout";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const resetMutation = useMutation({
    mutationFn: () =>
      authApi.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      }),
    onSuccess: () => {
      navigate(
        `/login?message=${encodeURIComponent(
          "Password reset successfully. Please sign in with your new password.",
        )}`,
        { replace: true },
      );
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationError("Enter a valid email address.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setValidationError("Enter the six-digit verification code.");
      return;
    }

    if (newPassword.length < 8) {
      setValidationError("Your new password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError("The new passwords do not match.");
      return;
    }

    resetMutation.mutate();
  };

  return (
    <AuthLayout
      panel={{
        eyebrow: "Account recovery",
        title: "Choose a new password.",
        text: "Verify your code and secure your account with a new password.",
        footnote: "Secure staff access • Room Rental Management System",
      }}
    >
      <AuthHeading
        eyebrow="Verify and reset"
        title="Create a new password"
        text="Enter the code sent to your email address."
      />

      {validationError && (
        <Alert type="error">{validationError}</Alert>
      )}

      {resetMutation.isError && (
        <Alert type="error">
          {getErrorMessage(
            resetMutation.error,
            "Unable to reset your password. Check the code and try again.",
          )}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <AuthField
          id="otp"
          label="Six-digit reset code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          maxLength={6}
          value={otp}
          onChange={(event) =>
            setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          required
        />

        <PasswordField
          id="newPassword"
          label="New password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />

        <PasswordField
          id="confirmPassword"
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Enter your password again"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />

        <Button
          type="submit"
          loading={resetMutation.isPending}
          className="h-12 w-full"
        >
          Reset password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Need a new code?{" "}
        <Link
          to={`/forgot-password?email=${encodeURIComponent(email.trim())}`}
          className="font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Request another code
        </Link>
      </p>

      <p className="mt-3 text-center text-sm text-slate-500">
        <Link
          to="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
