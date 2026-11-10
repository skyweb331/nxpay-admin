import { FieldErrorTooltip } from "./FieldErrorTooltip";
import { useRegisterLabel } from "./FieldShell";
import { Controller, useFormContext } from "react-hook-form";

import { Autocomplete, FormControl, FormLabel, TextField, useTheme } from "@mui/material";

import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiCross from "@/icons/nexture/ni-cross";

export type AutocompleteOption = { value: string; label: string; group?: string };

type Props = {
  name: string;
  label?: string;
  options: AutocompleteOption[];
  placeholder?: string;
  disabled?: boolean;
  disableClearable?: boolean;
  className?: string;
};

/** Single-value autocomplete storing `option.value` (country, region, chain pickers). */
export function RHFAutocomplete({ name, label, options, placeholder, disabled, disableClearable, className }: Props) {
  const { control } = useFormContext();
  const theme = useTheme();
  useRegisterLabel(name, label);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth className={className}>
          {label && (
            <FormLabel component="label" htmlFor={name}>
              {label}
            </FormLabel>
          )}
          {error?.message && <FieldErrorTooltip title={error.message} />}
          <Autocomplete
            id={name}
            size="small"
            disabled={disabled}
            disableClearable={disableClearable}
            options={options}
            groupBy={options.some((o) => o.group) ? (o) => o.group ?? "" : undefined}
            value={options.find((o) => o.value === field.value) ?? null}
            onChange={(_event, option) => field.onChange(option?.value ?? null)}
            onBlur={field.onBlur}
            isOptionEqualToValue={(a, b) => a.value === b.value}
            getOptionLabel={(o) => o.label}
            popupIcon={<NiChevronDownSmall />}
            clearIcon={<NiCross />}
            // Inline so it beats the global `.MuiPopper-root { z-index: 100 }` inside dialogs
            slotProps={{ popper: { className: "outlined", style: { zIndex: theme.zIndex.modal + 1 } } }}
            renderInput={(params) => (
              <TextField
                {...params}
                inputRef={field.ref}
                placeholder={placeholder}
                variant="standard"
                className="outlined"
                error={!!error}
              />
            )}
          />
        </FormControl>
      )}
    />
  );
}
