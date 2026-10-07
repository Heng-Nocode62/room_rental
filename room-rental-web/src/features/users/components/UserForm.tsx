
import { useForm } from "react-hook-form";

import { Button, Input } from "../../../components/ui";

export interface UserFormValues {
  username?: string;

  password?: string;

  firstName: string;

  lastName: string;

  email: string;

  phone: string;
}

interface Props {
  mode: "create" | "edit";

  initialValues?: Partial<UserFormValues>;

  loading?: boolean;

  onSubmit: (values: UserFormValues) => Promise<void>;
}

export function UserForm({
  mode,
  initialValues,
  loading = false,
  onSubmit,
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
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {mode === "create" && (
        <>
          <Input
            label="Username"
            requiredMark
            autoComplete="username"
            error={errors.username?.message}
            {...register("username", {
              required: "Username is required",

              maxLength: {
                value: 100,
                message: "Maximum 100 characters",
              },
            })}
          />

          <Input
            label="Password"
            requiredMark
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
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="First name"
          requiredMark
          error={errors.firstName?.message}
          {...register("firstName", {
            required: "First name is required",
          })}
        />

        <Input
          label="Last name"
          requiredMark
          error={errors.lastName?.message}
          {...register("lastName", {
            required: "Last name is required",
          })}
        />
      </div>

      <Input label="Email" type="email" {...register("email")} />

      <Input label="Phone" {...register("phone")} />

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          {mode === "create" ? "Create User" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
