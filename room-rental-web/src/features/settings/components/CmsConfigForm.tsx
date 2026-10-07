import { useForm } from "react-hook-form";

import { Button, Input } from "../../../components/ui";

import type { CmsConfig } from "../types/config";

interface Props {
  initialValues?: Partial<CmsConfig>;
  loading?: boolean;
  onSubmit: (values: CmsConfig) => Promise<void>;
}

export function CmsConfigForm({ initialValues, loading = false, onSubmit }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<CmsConfig>({
    defaultValues: {
      baseUrl: initialValues?.baseUrl ?? "",
      clientKey: initialValues?.clientKey ?? "",
      secretKey: initialValues?.secretKey ?? "",
      token: initialValues?.token ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Base URL"
        requiredMark
        placeholder="https://cms.example.com"
        error={errors.baseUrl?.message}
        {...register("baseUrl", { required: "Base URL is required" })}
      />

      <Input
        label="Client key"
        requiredMark
        error={errors.clientKey?.message}
        {...register("clientKey", { required: "Client key is required" })}
      />

      <Input
        label="Secret key"
        type="password"
        requiredMark
        error={errors.secretKey?.message}
        {...register("secretKey", { required: "Secret key is required" })}
      />

      <Input
        label="Token"
        type="password"
        error={errors.token?.message}
        {...register("token")}
      />

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
