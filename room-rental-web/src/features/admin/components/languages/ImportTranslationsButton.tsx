import { useRef } from "react";
import { Button } from "../../../../components/ui/index.ts";

interface Props {
  loading?: boolean;
  onImport: (file: File) => void;
}

export function ImportTranslationsButton({ loading = false, onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onImport(file);
          event.target.value = "";
        }}
      />
      <Button variant="secondary" loading={loading} onClick={() => inputRef.current?.click()}>
        Import XLSX
      </Button>
    </>
  );
}
