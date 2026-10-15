
import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "../../../components/ui/Button";
import { LoadingState } from "../../../components/ui/LoadingState";
import { authApi } from "../api/authApi";
import {
  currentUserQueryKey,
  useCurrentUser,
} from "../hooks/useCurrentUser";
import {
  Alert,
  AuthField,
  PasswordField,
  getErrorMessage,
} from "../components/AuthLayout";

export default function AccountProfilePage() {
  const queryClient = useQueryClient();
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useCurrentUser();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValidationError, setPasswordValidationError] = useState("");

  useEffect(() => {
    if (!user) return;

    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setPhone(user.phone ?? "");
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: () =>
      authApi.updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: currentUserQueryKey,
      });
      setProfileMessage("Your profile has been updated.");
    },
  });

  const changePassword = useMutation({
    mutationFn: () =>
      authApi.changeMyPassword({
        currentPassword,
        newPassword,
      }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordValidationError("");
      setPasswordMessage("Your password has been changed.");
    },
  });

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileMessage("");

    if (!firstName.trim() || !lastName.trim()) {
      setProfileMessage("First name and last name are required.");
      return;
    }

    updateProfile.mutate();
  };

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordValidationError("");
    setPasswordMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordValidationError("Complete all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordValidationError(
        "Your new password must contain at least 8 characters.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordValidationError("The new passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordValidationError(
        "Choose a password different from your current password.",
      );
      return;
    }

    changePassword.mutate();
  };

  if (isLoading) {
    return <LoadingState label="Loading your profile..." />;
  }

  if (isError || !user) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <Alert type="error">
          {getErrorMessage(error, "Unable to load your account. Please refresh the page.")}
        </Alert>
      </div>
    );
  }

  const fullName =
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
    user.username ||
    "Account";

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
    (user.username?.[0] ?? "U").toUpperCase();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-sm font-semibold text-indigo-600">Account settings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          My Profile
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your personal information and account security.
        </p>
      </header>

      {/* Account summary */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-400" />

        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-700 ring-1 ring-indigo-100">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold text-slate-950">
              {fullName}
            </h2>
            <p className="mt-1 truncate text-sm text-slate-500">
              {user.email || "No email available"}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <span
                  key={role.id}
                  className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
                >
                  {role.name || role.code}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Account status
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {user.status || "Unknown"}
            </p>
          </div>
        </div>
      </section>

      {/* Personal information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Personal information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Update the personal information associated with your account.
          </p>
        </div>

        {profileMessage && (
          <Alert
            type={
              updateProfile.isError ||
              profileMessage === "First name and last name are required."
                ? "error"
                : "success"
            }
          >
            {updateProfile.isError
              ? getErrorMessage(
                  updateProfile.error,
                  "Unable to update your profile.",
                )
              : profileMessage}
          </Alert>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <AuthField
              id="firstName"
              label="First name"
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              maxLength={50}
              required
            />

            <AuthField
              id="lastName"
              label="Last name"
              autoComplete="family-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              maxLength={50}
              required
            />

            <AuthField
              id="profileEmail"
              label="Email address"
              type="email"
              value={user.email ?? ""}
              readOnly
              className="bg-slate-50"
              hint="Email cannot be changed from this page."
            />

            <AuthField
              id="phone"
              label="Phone number"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              maxLength={30}
              placeholder="Enter your phone number"
            />
          </div>

          {updateProfile.isError && !profileMessage && (
            <Alert type="error">
              {getErrorMessage(
                updateProfile.error,
                "Unable to update your profile.",
              )}
            </Alert>
          )}

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <Button
              type="submit"
              loading={updateProfile.isPending}
              className="min-w-36"
            >
              Save changes
            </Button>
          </div>
        </form>
      </section>

      {/* Password security */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Change password
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter your current password to choose a new one.
          </p>
        </div>

        {passwordMessage && <Alert type="success">{passwordMessage}</Alert>}

        {passwordValidationError && (
          <Alert type="error">{passwordValidationError}</Alert>
        )}

        {changePassword.isError && (
          <Alert type="error">
            {getErrorMessage(
              changePassword.error,
              "Unable to change your password. Check your current password and try again.",
            )}
          </Alert>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <PasswordField
            id="currentPassword"
            label="Current password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <PasswordField
              id="newPassword"
              label="New password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              hint="Use at least 8 characters."
            />

            <PasswordField
              id="confirmPassword"
              label="Confirm new password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <Button
              type="submit"
              loading={changePassword.isPending}
              className="min-w-36"
            >
              Update password
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
