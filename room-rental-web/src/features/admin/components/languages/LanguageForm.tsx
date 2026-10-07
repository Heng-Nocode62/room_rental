import { useForm } from "react-hook-form";
import { Button, Input } from "../../../../components/ui/index.ts";

export interface LanguageFormValues {
  code: string;
  title: string;
  flag: string;
  active: boolean;
}

interface Props {
  mode: "create" | "edit";
  initialValues?: {
    code?: string;
    title?: string;
    flag?: string | null;
    active?: boolean;
  };
  loading?: boolean;
  onSubmit: (values: LanguageFormValues) => Promise<void>;
}

export function LanguageForm({ mode, initialValues, loading = false, onSubmit }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<LanguageFormValues>({
    defaultValues: {
      code: initialValues?.code ?? "",
      title: initialValues?.title ?? "",
      flag: initialValues?.flag ?? "",
      active: initialValues?.active ?? true,
    },
  });

  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
    <Input label="Language code" requiredMark placeholder="en or en-US"
      hint="2–20 letters, optionally followed by a region (e.g. en, km, en-US)"
      error={errors.code?.message}
      {...register("code", { required: "Language code is required", maxLength: { value: 20, message: "Maximum 20 characters" },
        pattern: { value: /^[A-Za-z]{2,20}([_-][A-Za-z0-9]{2,10})?$/, message: "Invalid language code" } })} />
    <Input label="Title" requiredMark placeholder="English" error={errors.title?.message}
      {...register("title", { required: "Title is required", maxLength: { value: 100, message: "Maximum 100 characters" } })} />
    <Input label="Flag" placeholder="🇬🇧 or a flag URL" error={errors.flag?.message}
      {...register("flag", { maxLength: { value: 2048, message: "Maximum 2048 characters" } })} />
    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
      <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register("active")} /> Active
    </label>
    <div className="flex justify-end"><Button type="submit" loading={loading}>{mode === "create" ? "Create Language" : "Save Changes"}</Button></div>
  </form>;
}
