import { FieldErrorTooltip } from "./FieldErrorTooltip";
import { useRegisterLabel } from "./FieldShell";
import { MuiOtpInput } from "mui-one-time-password-input";
import { Controller, useFormContext } from "react-hook-form";

import { Box, FormLabel } from "@mui/material";

type Props = {
  name: string;
  label?: string;
  length?: number;
  autoFocus?: boolean;
  onComplete?: (value: string) => void;
};

/** The starter's set-verification OTP input. */
export function RHFOtp({ name, label = "Verification Code", length = 6, autoFocus, onComplete }: Props) {
  const { control } = useFormContext();
  useRegisterLabel(name, label);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box className="mb-4 flex flex-col">
          <FormLabel component="label" className="flex flex-row gap-1">
            <Box>{label}</Box>
            {error?.message && <FieldErrorTooltip title={error.message} inline />}
          </FormLabel>
          <MuiOtpInput
            value={field.value ?? ""}
            onChange={(value) => field.onChange(value.replace(/\D/g, ""))}
            onComplete={onComplete}
            length={length}
            autoFocus={autoFocus}
            validateChar={(char) => /^\d$/.test(char)}
            TextFieldsProps={{
              size: "small",
              variant: "standard",
              className: "outlined",
              error: !!error,
              slotProps: { htmlInput: { inputMode: "numeric" } },
            }}
            className="gap-1 md:gap-2"
          />
        </Box>
      )}
    />
  );
}
