import {
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import LoadingScreen from "@/components/LoadingScreen";
import { CUSTOMER_VOLUMES } from "@/libs/Customer/useApollo";
import { fPeriod } from "@/utils/format-time";
import { errorMessage } from "@/utils/graphql";
import { formatMoney } from "@/utils/money";
import { useQuery } from "@apollo/client/react";

/** Last 24 billing months, USD equivalent (the basis of the tiered fee). */
export function VolumesTab({ customerId }: { customerId: string }) {
  const { data, loading, error } = useQuery(CUSTOMER_VOLUMES, {
    variables: { filter: { customerId }, sort: "periodKey", page: "1,24" },
  });
  const rows = data?.monthlyVolumes.monthlyVolumes ?? [];

  if (loading && !data) return <LoadingScreen inline />;

  return (
    <Card>
      <CardContent>
        {error && (
          <Alert severity="error" className="mb-4">
            {errorMessage(error)}
          </Alert>
        )}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell align="right">Deposits</TableCell>
                <TableCell align="right">Volume (USD)</TableCell>
                <TableCell align="right">Fees (USD)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-text-secondary text-center">
                    No volume yet
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{fPeriod(row.periodKey)}</TableCell>
                  <TableCell align="right">{row.txCount}</TableCell>
                  <TableCell align="right">{formatMoney(row.volumeInCents, "usd")}</TableCell>
                  <TableCell align="right">{formatMoney(row.feeInCents, "usd")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
