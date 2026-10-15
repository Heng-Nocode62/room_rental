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

/* ─── Page ───────────────────────────────────────────────── */
export default function UserProfilePage() {
  const { data: user, refetch } = useCurrentUser();

  const update = useUpdateUser();
  const changePassword = useChangePassword();

  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [dark, setDark] = useState(
    () => document.documentElement.classList.contains("dark"),
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

  /* ── Keep handler logic exactly ─────────────────────────── */
  const saveProfile = async () => {
    await update.mutateAsync({
      id: user.id,
      request: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      },
    });
    await refetch();
    setEditOpen(false);
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      return;
    }
    await changePassword.mutateAsync({
      id: user.id,
      request: { currentPassword, newPassword },
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordOpen(false);
  };

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("user-theme", next ? "dark" : "light");
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-6 px-4 py-5 lg:px-8">
      <SectionTitle
        eyebrow="Account"
        title="My Profile"
        description="Manage your personal information, security and preferences."
      />

      {/* ── Profile Hero Card ──────────────────────────────── */}
      <Card className="overflow-hidden">
        {/* Gradient banner */}
        <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-6 pb-10 pt-8">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-2xl font-black text-white shadow-lg backdrop-blur-sm ring-4 ring-white/10">
                {initials}
              </div>

              <div>
                <p className="text-2xl font-bold tracking-tight text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="mt-1 text-sm text-blue-100">@{user.username}</p>

                {/* Role badge */}
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {user.role ?? "User"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info grid — pulled up to overlap the banner bottom */}
        <div className="-mt-0 grid gap-3 p-6 sm:grid-cols-2">
          <InfoTile icon="mail" label="Email" value={user.email || "—"} />
          <InfoTile icon="phone" label="Phone" value={user.phone || "—"} />
          <InfoTile
            icon="user"
            label="Username"
            value={user.username || "—"}
          />
          <InfoTile icon="shield" label="Status" value="Active" />
        </div>

        {/* Edit footer */}
        <div className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <Button onClick={() => setEditOpen(true)}>Edit profile</Button>
        </div>
      </Card>

      {/* ── Cards grid: Security + Preferences ────────────── */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Security card */}
        <Card className="flex flex-col gap-5 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Icon name="lock" size={19} />
            </div>
            <div>
              <h2 className="font-bold text-slate-950 dark:text-white">
                Security
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Keep your account safe with a strong, unique password.
              </p>
            </div>
          </div>

          <div className="mt-auto">
            <Button
              variant="secondary"
              onClick={() => setPasswordOpen(true)}
            >
              Change password
            </Button>
          </div>
        </Card>

        {/* Preferences card */}
        <Card className="flex flex-col gap-5 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Icon name="settings" size={19} />
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

          {/* Dark mode toggle row */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
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
                  {dark ? "Dark appearance is on." : "Light appearance is on."}
                </p>
              </div>
            </div>

            {/* Pill toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={dark}
              className={[
                "relative h-7 w-12 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                dark ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200",
                  dark ? "left-6" : "left-1",
                ].join(" ")}
              />
            </button>
          </div>
        </Card>
      </div>

      {/* ── Edit Profile Modal ─────────────────────────────── */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit profile"
        description="Update your personal information below."
      >
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {update.isError && (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
              Unable to update your profile. Please try again.
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end sm:gap-3">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={update.isPending}
              onClick={() => void saveProfile()}
            >
              Save changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Change Password Modal ──────────────────────────── */}
      <Modal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="Change password"
        description="Enter your current password and choose a new one."
      >
        <div className="space-y-5">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* Inline validation hint */}
          {confirmPassword && newPassword !== confirmPassword && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 dark:bg-rose-500/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-rose-500"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm text-rose-600 dark:text-rose-400">
                Passwords do not match.
              </p>
            </div>
          )}

          {changePassword.isError && (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
              Unable to change your password. Please check your current password.
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end sm:gap-3">
            <Button variant="secondary" onClick={() => setPasswordOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={changePassword.isPending}
              disabled={
                !currentPassword ||
                !newPassword ||
                newPassword !== confirmPassword
              }
              onClick={() => void savePassword()}
            >
              Change password
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Info tile sub-component ────────────────────────────── */
function InfoTile({
  icon,
  label,
  value,
}: {
  icon: "mail" | "phone" | "user" | "shield";
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon name={icon} size={14} />
        <span className="text-xs font-semibold uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}