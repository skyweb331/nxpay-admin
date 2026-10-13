import { FormLabelsContext } from "./FieldShell";
import { useContext } from "react";
import { type FieldErrors, useFormContext } from "react-hook-form";

import { Alert, AlertTitle, Box, capitalize, Typography } from "@mui/material";

import NiCrossSquare from "@/icons/nexture/ni-cross-square";

function flatten(errors: FieldErrors, prefix = ""): [string, string][] {
  const out: [string, string][] = [];
  for (const [key, value] of Object.entries(errors)) {
    if (!value) continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value.message === "string" && value.message) out.push([path, value.message]);
    else if (typeof value === "object") out.push(...flatten(value as FieldErrors, path));
  }
  return out;
}

const humanize = (path: string) =>
  path
    .split(".")
    .map((part) => (/^\d+$/.test(part) ? `#${Number(part) + 1}` : capitalize(part.replace(/([a-z])([A-Z])/g, "$1 $2"))))
    .join(" ");

/** The starter's "The following inputs have errors!" alert, after a failed submit. */
export function FormErrorSummary({ className }: { className?: string }) {
  const labels = useContext(FormLabelsContext);
  const {
    formState: { errors, isSubmitted },
  } = useFormContext();
  const list = flatten(errors).filter(([path]) => path !== "root");
  const root = errors.root?.message;
  if (!isSubmitted || (!list.length && !root)) return null;

  return (
    <Alert severity="error" icon={<NiCrossSquare />} className={className ?? "neutral bg-background-paper/60! mb-4"}>
      <AlertTitle variant="subtitle2">{list.length ? "The following inputs have errors!" : root}</AlertTitle>
      {list.map(([path, message]) => (
        <Typography variant="body2" className="text-text-primary" key={path}>
          <Box component="span" className="text-error">
            {labels?.get(path) ?? humanize(path)}:
          </Box>{" "}
          {message}
        </Typography>
      ))}
      {list.length > 0 && root && (
        <Typography variant="body2" className="text-text-primary mt-1">
          {root}
        </Typography>
      )}
    </Alert>
  );
}
