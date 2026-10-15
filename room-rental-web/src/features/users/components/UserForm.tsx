import { useForm } from "react-hook-form";

import { Button, Input } from "../../../components/ui";

export interface UserFormValues {
  username?: string;

  password?: string;

  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  /** Only used in create mode. Roles are changed later via UserRoleManager. */
  roleId?: number;
}

export interface RoleOption {
  id: number;
  name: string;
}

interface Props {
  mode: "create" | "edit";

  initialValues?: Partial<UserFormValues>;

  /** Roles available in the select (create mode only) */
  roles?: RoleOption[];

  rolesLoading?: boolean;

  loading?: boolean;

  /** Server-side error message to show above the buttons */
  error?: string | null;

  onSubmit: (values: UserFormValues) => Promise<void>;

  onCancel?: () => void;
}

export function UserForm({
  mode,
  initialValues,
  roles = [],
  rolesLoading = false,
  loading = false,
  error,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    defaultValues: {
      username: initialValues?.username ?? "",
      password: "",
      firstName: initialValues?.firstName ?? "",
      lastName: initialValues?.lastName ?? "",
      email: initialValues?.email ?? "",
      phone: initialValues?.phone ?? "",
      roleId: initialValues?.roleId,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {mode === "create" && (
        <Section title="Account" hint="Used to sign in to the system.">
          <Input
            label="Username"
            placeholder=" "
            requiredMark
            autoComplete="username"
            autoFocus
            error={errors.username?.message}
            {...register("username", {
              required: "Username is required",
              maxLength: { value: 100, message: "Maximum 100 characters" },
              pattern: {
                value: /^\S+$/,
                message: "Username cannot contain spaces",
              },
            })}
          />

          <Input
            label="Password"
            requiredMark
            placeholder=" "
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />

          <p className="-mt-2 text-xs text-slate-500">
            Use at least 8 characters. The user can change it after signing in.
          </p>
        </Section>
      )}

      <Section title="Profile">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            placeholder=" "
            requiredMark
            autoFocus={mode === "edit"}
            error={errors.firstName?.message}
            {...register("firstName", {
              required: "First name is required",
            })}
          />

          <Input
            label="Last name"
            placeholder=" "
            requiredMark
            error={errors.lastName?.message}
            {...register("lastName", {
              required: "Last name is required",
            })}
          />
        </div>
      </Section>

      <Section title="Contact" hint="Optional.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            placeholder=" "
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email", {
              pattern: {
                value: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            })}
          />

          <Input
            placeholder=" "
            label="Phone"
            type="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register("phone", {
              pattern: {
                value: /^$|^[0-9+\-\s()]{6,20}$/,
                message: "Enter a valid phone number",
              },
            })}
          />
        </div>
      </Section>

      {mode === "create" && (
        <Section title="Role" hint="Determines what the user can access.">
          <div>
            <label
              htmlFor="roleId"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Role <span className="text-red-500">*</span>
            </label>

            <select
              id="roleId"
              disabled={rolesLoading}
              aria-invalid={Boolean(errors.roleId)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
              {...register("roleId", {
                setValueAs: (v) =>
                  v === "" || v == null ? undefined : Number(v),
                validate: (v) => (v ? true : "Role is required"),
              })}
            >
              <option value="">
                {rolesLoading ? "Loading roles..." : "Select a role"}
              </option>

              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>

            {errors.roleId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.roleId.message}
              </p>
            )}
          </div>
        </Section>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}

        <Button type="submit" loading={loading}>
          {mode === "create" ? "Create user" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4 p-2">
      <legend className="mb-1 flex items-baseline gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {title}
        </span>

        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </legend>

      {children}
    </fieldset>
  );
}