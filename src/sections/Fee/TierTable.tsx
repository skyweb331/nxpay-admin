import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

import { cn } from "@/lib/utils";
import { tierRangeLabel } from "@/utils/fee";
import { bpsToPercent } from "@/utils/money";

export type TierRow = {
  id: string;
  position: number;
  fromInCents: bigint;
  toInCents?: bigint | null;
  rateBps: number;
};

/** Read-only view of a schedule's tiers; every number comes from the API. */
export function TierTable({
  tiers,
  activeTierId,
  dense,
}: {
  tiers: TierRow[];
  activeTierId?: string;
  dense?: boolean;
}) {
  const sorted = [...tiers].sort((a, b) => a.position - b.position);

  return (
    <TableContainer>
      <Table size={dense ? "small" : "medium"}>
        <TableHead>
          <TableRow>
            <TableCell>Monthly volume (USD)</TableCell>
            <TableCell align="right">Fee on that portion</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((tier) => (
            <TableRow key={tier.id} className={cn(tier.id === activeTierId && "bg-primary/5")}>
              <TableCell>
                <Box className="flex items-center gap-2">
                  <Typography variant="body2" component="span">
                    {tierRangeLabel(tier)}
                  </Typography>
                  {tier.id === activeTierId && (
                    <Typography variant="caption" className="text-primary font-semibold">
                      You are here
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" component="span">
                  {tier.rateBps === 0 ? "Free" : bpsToPercent(tier.rateBps)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TierTable;
