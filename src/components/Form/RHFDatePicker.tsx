import { FieldErrorTooltip } from "./FieldErrorTooltip";
import { useRegisterLabel } from "./FieldShell";
import dayjs, { type Dayjs } from "dayjs";
import { Controller, useFormContext } from "react-hook-form";

import { FormControl, FormLabel } from "@mui/material";
import { DatePicker, type DateView } from "@mui/x-date-pickers";

import NiCalendar from "@/icons/nexture/ni-calendar";

type Props = {
  name: string;
  label?: string;
  views?: DateView[];
  format?: string;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  /** Stored string format, e.g. "YYYY-MM" for a month picker */
  valueFormat?: string;
  shouldDisableMonth?: (month: Dayjs) => boolean;
  disabled?: boolean;
};

/** MUI X DatePicker styled by the starter's date-time-picker.css; stores a formatted string. */
export function RHFDatePicker({ name, label, valueFormat = "YYYY-MM-DD", format, views, ...other }: Props) {
  const { control } = useFormContext();
  useRegisterLabel(name, label);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth>
          {label && (
            <FormLabel component="label" htmlFor={name}>
              {label}
            </FormLabel>
          )}
          {error?.message && <FieldErrorTooltip title={error.message} />}
          <DatePicker
            {...other}
            views={views}
            format={format ?? (views?.includes("day") === false ? "MMMM YYYY" : "MMM D, YYYY")}
            value={field.value ? dayjs(field.value, valueFormat) : null}
            onChange={(value) => field.onChange(value && value.isValid() ? value.format(valueFormat) : null)}
            inputRef={field.ref}
            slots={{ openPickerIcon: NiCalendar }}
            slotProps={{
              textField: {
                id: name,
                size: "small",
                variant: "standard",
                className: "outlined",
                error: !!error,
                onBlur: field.onBlur,
              },
              popper: { className: "outlined" },
            }}
          />
        </FormControl>
      )}
    />
  );
}
