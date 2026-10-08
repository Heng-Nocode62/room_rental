import { useEffect, useState } from "react";

import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useUpdateUser } from "../../users/hooks/useUpdateUser";
import { useChangePassword } from "../../users/hooks/useChangePassword";

import {
  Button,
  Card,
  Icon,
  Input,
  Modal,
  PageLoading,
  SectionTitle,
} from "../components/UserUI";

export default function UserProfilePage() {
  const { data: user, refetch } =
    useCurrentUser();

  const update = useUpdateUser();
  const changePassword =
    useChangePassword();

  const [editOpen, setEditOpen] =
    useState(false);

  const [passwordOpen, setPasswordOpen] =
    useState(false);

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [dark, setDark] =
    useState(
      () =>
        document.documentElement.classList.contains(
          "dark",
        ),
    );

  useEffect(() => {
    if (!user) return;

    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email ?? "");
    setPhone(user.phone ?? "");
  }, [user]);

  if (!user) {
    return <PageLoading />;
  }

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  const saveProfile =
    async () => {
      await update.mutateAsync({
        id: user.id,
        request: {
          firstName:
            firstName.trim(),
          lastName:
            lastName.trim(),
          email:
            email.trim() || undefined,
          phone:
            phone.trim() || undefined,
        },
      });

      await refetch();

      setEditOpen(false);
    };

  const savePassword =
    async () => {
      if (
        !currentPassword ||
        !newPassword ||
        newPassword !==
          confirmPassword
      ) {
        return;
      }

      await changePassword.mutateAsync({
        id: user.id,
        request: {
          currentPassword,
          newPassword,
        },
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordOpen(false);
    };

  const toggleTheme = () => {
    const next = !dark;

    setDark(next);

    document.documentElement.classList.toggle(
      "dark",
      next,
    );

    localStorage.setItem(
      "user-theme",
      next ? "dark" : "light",
    );
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-8 px-4 py-8 lg:px-8">
      <SectionTitle
        eyebrow="Account"
        title="My Profile"
        description="Manage your personal information, security and preferences."
      />

      {/* PROFILE */}

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-xl font-black text-white backdrop-blur">
              {initials}
            </div>

            <div>
              <p className="text-xl font-bold text-white">
                {user.firstName}{" "}
                {user.lastName}
              </p>

              <p className="mt-1 text-sm text-blue-100">
                @{user.username}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <Info
            icon="mail"
            label="Email"
            value={user.email || "—"}
          />

          <Info
            icon="phone"
            label="Phone"
            value={user.phone || "—"}
          />

          <Info
            icon="user"
            label="Username"
            value={
              user.username || "—"
            }
          />

          <Info
            icon="shield"
            label="Account"
            value="Active"
          />
        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <Button
            onClick={() =>
              setEditOpen(true)
            }
          >
            Edit profile
          </Button>
        </div>
      </Card>

      {/* SECURITY */}

      <Card className="p-6">
        <div className="flex items-start justify-between gap-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Icon
                name="lock"
                size={19}
              />
            </div>

            <div>
              <h2 className="font-bold text-slate-950 dark:text-white">
                Security
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Keep your account secure with a strong password.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() =>
              setPasswordOpen(true)
            }
          >
            Change password
          </Button>
        </div>
      </Card>

      {/* PREFERENCES */}

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <Icon
              name="settings"
              size={19}
            />
          </div>

          <div>
            <h2 className="font-bold text-slate-950 dark:text-white">
              Preferences
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Customize the appearance of your portal.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Icon
              name={dark ? "moon" : "sun"}
              size={18}
              className="text-slate-500"
            />

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Dark mode
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {dark
                  ? "Dark appearance is enabled."
                  : "Use the light appearance."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className={[
              "relative h-7 w-12 rounded-full transition",
              dark
                ? "bg-blue-600"
                : "bg-slate-300 dark:bg-slate-700",
            ].join(" ")}
          >
            <span
              className={[
                "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
                dark
                  ? "left-6"
                  : "left-1",
              ].join(" ")}
            />
          </button>
        </div>
      </Card>

      {/* EDIT PROFILE */}

      <Modal
        open={editOpen}
        onClose={() =>
          setEditOpen(false)
        }
        title="Edit profile"
        description="Update your personal information."
      >
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              value={firstName}
              onChange={(event) =>
                setFirstName(
                  event.target.value,
                )
              }
            />

            <Input
              label="Last name"
              value={lastName}
              onChange={(event) =>
                setLastName(
                  event.target.value,
                )
              }
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value,
              )
            }
          />

          <Input
            label="Phone"
            value={phone}
            onChange={(event) =>
              setPhone(
                event.target.value,
              )
            }
          />

          {update.isError && (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
              Unable to update your profile.
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
            <Button
              variant="secondary"
              onClick={() =>
                setEditOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              loading={update.isPending}
              onClick={() =>
                void saveProfile()
              }
            >
              Save changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* CHANGE PASSWORD */}

      <Modal
        open={passwordOpen}
        onClose={() =>
          setPasswordOpen(false)
        }
        title="Change password"
        description="Enter your current password and choose a new one."
      >
        <div className="space-y-5">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(event) =>
              setCurrentPassword(
                event.target.value,
              )
            }
          />

          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(event) =>
              setNewPassword(
                event.target.value,
              )
            }
          />

          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(
                event.target.value,
              )
            }
          />

          {confirmPassword &&
            newPassword !==
              confirmPassword && (
              <p className="text-sm text-rose-600 dark:text-rose-400">
                Passwords do not match.
              </p>
            )}

          {changePassword.isError && (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
              Unable to change your password.
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
            <Button
              variant="secondary"
              onClick={() =>
                setPasswordOpen(
                  false,
                )
              }
            >
              Cancel
            </Button>

            <Button
              loading={
                changePassword.isPending
              }
              disabled={
                !currentPassword ||
                !newPassword ||
                newPassword !==
                  confirmPassword
              }
              onClick={() =>
                void savePassword()
              }
            >
              Change password
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon:
    | "mail"
    | "phone"
    | "user"
    | "shield";
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon name={icon} size={15} />
        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}