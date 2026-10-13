import { FieldErrorTooltip } from "./FieldErrorTooltip";
import { useRegisterLabel } from "./FieldShell";
import { Controller, useFormContext } from "react-hook-form";

import NumberField from "@/components/base-ui/number-field";

type Props = {
  name: string;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  /** Fraction digits shown and accepted (2 for fee rates) */
  decimals?: number;
  disabled?: boolean;
  className?: string;
};

/** The starter's base-ui NumberField; stores a number (null when empty). */
export function RHFNumberField({ name, label, min, max, step = 1, decimals = 0, disabled, className }: Props) {
  const { control } = useFormContext();
  useRegisterLabel(name, label);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="relative">
          {error?.message && (
            <div className="absolute inset-x-0 top-6">
              <FieldErrorTooltip title={error.message} />
            </div>
          )}
          <NumberField
            id={name}
            name={field.name}
            label={label}
            variant="standard"
            size="small"
            formControlClassName={className ?? "outlined w-full"}
            error={!!error}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            format={{ minimumFractionDigits: 0, maximumFractionDigits: decimals }}
            value={field.value ?? null}
            onValueChange={(value) => field.onChange(value)}
            onBlur={field.onBlur}
          />
        </div>
      )}
    />
  );
}
