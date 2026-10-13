import { FieldErrorTooltip } from "./FieldErrorTooltip";
import { createContext, useContext, useEffect } from "react";
import type { FieldError } from "react-hook-form";

import { FilledInput, FormControl, FormHelperText, FormLabel, Input, InputLabel, OutlinedInput } from "@mui/material";

import { cn } from "@/lib/utils";

/** The starter's four validation-demo styles; `standard-outlined` is the default everywhere. */
export type FieldVariant = "standard-outlined" | "standard" | "outlined" | "filled";

export const FormLabelsContext = createContext<Map<string, string> | null>(null);

/** Lets FormErrorSummary show "Email: ..." instead of the raw field name. */
export function useRegisterLabel(name: string, label: React.ReactNode) {
  const labels = useContext(FormLabelsContext);
  useEffect(() => {
    if (labels && typeof label === "string") labels.set(name, label);
  }, [labels, name, label]);
}

export function inputComponentFor(variant: FieldVariant) {
  if (variant === "outlined") return OutlinedInput;
  if (variant === "filled") return FilledInput;
  return Input;
}

type ShellProps = {
  name: string;
  label?: React.ReactNode;
  error?: FieldError;
  helperText?: React.ReactNode;
  variant?: FieldVariant;
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

/**
 * `FormControl variant="standard" size="small" className="outlined"` + `FormLabel` +
 * the error tooltip, exactly like the starter's validation examples.
 */
export function FieldShell({
  name,
  label,
  error,
  helperText,
  variant = "standard-outlined",
  fullWidth = true,
  required,
  disabled,
  className,
  children,
}: ShellProps) {
  useRegisterLabel(name, label);
  const standard = variant === "standard-outlined" || variant === "standard";

  return (
    <FormControl
      variant={standard ? "standard" : variant}
      size="small"
      fullWidth={fullWidth}
      required={required}
      disabled={disabled}
      error={!!error}
      className={cn(variant === "standard-outlined" && "outlined", className)}
    >
      {label &&
        (standard ? (
          <FormLabel component="label" htmlFor={name}>
            {label}
          </FormLabel>
        ) : (
          <InputLabel htmlFor={name}>{label}</InputLabel>
        ))}
      {error?.message && <FieldErrorTooltip title={error.message} />}
      {children}
      {helperText && !error && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
