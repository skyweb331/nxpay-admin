import { Box, Button, Tooltip } from "@mui/material";

import NiCrossSquare from "@/icons/nexture/ni-cross-square";
import { cn } from "@/lib/utils";

/** The starter's `InputErrorTooltip`. */
export function FieldErrorTooltip({ title, inline = false }: { title: string; inline?: boolean }) {
  return (
    <Box className={cn("relative z-10", !inline && "w-full")}>
      <Tooltip title={title} arrow className={cn("absolute", inline ? "-top-0.5" : "inset-e-1 top-0.5")}>
        <Button
          startIcon={<NiCrossSquare size="small" />}
          color="error"
          size="small"
          aria-label={title}
          className={cn("group icon-only bg-background-paper! outline-0!", inline && "p-1!")}
        ></Button>
      </Tooltip>
    </Box>
  );
}
