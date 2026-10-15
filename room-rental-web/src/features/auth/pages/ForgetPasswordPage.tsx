
import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { Button } from "../../../components/ui/Button";
import { authApi } from "../api/authApi";
import {
  Alert,
  AuthField,
  AuthHeading,
  AuthLayout,
  getErrorMessage,
} from "../components/AuthLayout";

export default function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [submitted, setSubmitted] = useState(false);

  const requestMutation = useMutation({
    mutationFn: () =>
      authApi.requestPasswordReset({ email: email.trim() }),
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(false);
    requestMutation.mutate();
  };

  return (
    <AuthLayout
      panel={{
        eyebrow: "Account recovery",
        title: "Get back to your workspace.",
        text: "Request a verification code to reset your password securely.",
        footnote: "Secure staff access • Room Rental Management System",
      }}
    >
      <AuthHeading
        eyebrow="Account recovery"
        title="Forgot password?"
        text="Enter the email address associated with your account."
      />

      {submitted && (
        <Alert type="success">
          If an eligible account exists for that email, a reset code
          has been sent. Please check your inbox and spam folder.
        </Alert>
      )}

      {requestMutation.isError && (
        <Alert type="error">
          {getErrorMessage(
            requestMutation.error,
            "Unable to process your request. Please try again.",
          )}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="you@example.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setSubmitted(false);
          }}
          required
        />

        <Button
          type="submit"
          loading={requestMutation.isPending}
          className="h-12 w-full"
        >
          Send reset code
        </Button>
      </form>

      {submitted && (
        <p className="mt-5 text-center text-sm text-slate-500">
          Already have your code?{" "}
          <Link
            to={`/reset-password?email=${encodeURIComponent(email.trim())}`}
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Reset password
          </Link>
        </p>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        Remember your password?{" "}
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
