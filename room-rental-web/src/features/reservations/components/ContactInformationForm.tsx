import { Input, Textarea } from "../../../components/ui";

export interface ContactFormValues {
  purpose: string;
  contactName: string;
  contactPhone: string;
  companyName: string;
  notes: string;
}

interface ContactInformationFormProps {
  values: ContactFormValues;

  onChange: (values: ContactFormValues) => void;
}

export function ContactInformationForm({
  values,
  onChange,
}: ContactInformationFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Purpose *"
          value={values.purpose}
          onChange={(event) =>
            onChange({
              ...values,
              purpose: event.target.value,
            })
          }
        />
        <Input
          label="Contact name *"
          value={values.contactName}
          onChange={(event) =>
            onChange({
              ...values,
              contactName: event.target.value,
            })
          }
        />

        <Input
          label="Contact phone"
          value={values.contactPhone}
          onChange={(event) =>
            onChange({
              ...values,
              contactPhone: event.target.value,
            })
          }
        />

        <Input
          label="Company"
          value={values.companyName}
          onChange={(event) =>
            onChange({
              ...values,
              companyName: event.target.value,
            })
          }
        />
      </div>

      <Textarea
        label="Notes"
        value={values.notes}
        onChange={(event) =>
          onChange({
            ...values,
            notes: event.target.value,
          })
        }
      />
    </div>
  );
}
