import { FieldShell, type FieldVariant, inputComponentFor } from "./FieldShell";
import { forwardRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { IMaskInput } from "react-imask";

import { InputAdornment } from "@mui/material";

import { centsToDecimal, decimalToCents } from "@/utils/money";

type MaskProps = {
  name: string;
  onChange: (event: { target: { name: string; value: string } }) => void;
};

/** The starter's `text-field-mask.tsx` pattern with a money mask. */
const MoneyMask = forwardRef<HTMLInputElement, MaskProps>(function MoneyMask({ onChange, ...other }, ref) {
  return (
    <IMaskInput
      {...other}
      mask={Number}
      scale={2}
      radix="."
      mapToRadix={[","]}
      thousandsSeparator=","
      normalizeZeros={false}
      padFractionalZeros={false}
      min={0}
      max={9_999_999_999}
      inputRef={ref}
      unmask
      onAccept={(value: string) => onChange({ target: { name: other.name, value } })}
    />
  );
});

type Props = {
  name: string;
  label?: React.ReactNode;
  currency?: "usd" | "eur";
  helperText?: React.ReactNode;
  variant?: FieldVariant;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

const display = (cents: unknown) =>
  cents === null || cents === undefined || cents === "" ? "" : centsToDecimal(cents as bigint).replace(/\.00$/, "");

/** Currency input that stores integer cents as `bigint` (null when empty). */
export function RHFAmount({
  name,
  label,
  currency = "usd",
  helperText,
  variant = "standard-outlined",
  placeholder,
  ...other
}: Props) {
  const { control } = useFormContext();
  const InputComponent = inputComponentFor(variant);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FieldShell name={name} label={label} error={error} helperText={helperText} variant={variant} {...other}>
          <AmountInput
            InputComponent={InputComponent}
            name={field.name}
            inputRef={field.ref}
            value={field.value as bigint | null}
            onChange={field.onChange}
            onBlur={field.onBlur}
            currency={currency}
            placeholder={placeholder}
            disabled={other.disabled}
            error={!!error}
          />
        </FieldShell>
      )}
    />
  );
}

function AmountInput({
  InputComponent,
  value,
  onChange,
  currency,
  ...rest
}: {
  InputComponent: ReturnType<typeof inputComponentFor>;
  name: string;
  inputRef: React.Ref<HTMLInputElement>;
  value: bigint | null;
  onChange: (value: bigint | null) => void;
  onBlur: () => void;
  currency: "usd" | "eur";
  placeholder?: string;
  disabled?: boolean;
  error: boolean;
}) {
  // Local text so a trailing "." or "0" survives while typing
  const [text, setText] = useState(() => display(value));
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    const parsed = text === "" ? null : decimalToCents(text);
    if (parsed !== value) setText(display(value));
  }

  return (
    <InputComponent
      {...rest}
      id={rest.name}
      value={text}
      onChange={(event) => {
        const next = event.target.value;
        setText(next);
        onChange(next === "" ? null : decimalToCents(next));
      }}
      inputComponent={MoneyMask as never}
      inputProps={{ inputMode: "decimal" }}
      startAdornment={<InputAdornment position="start">{currency === "eur" ? "€" : "$"}</InputAdornment>}
    />
  );
}
