import { Link } from "react-router";

import { Box, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

import type { TransactionRowFragment } from "@/__generated__/graphql";
import MoneyText from "@/components/MoneyText";
import StatusChip, { statusLabel } from "@/components/StatusChip";
import { paths } from "@/routes/paths";
import { fDateTime, fRelative } from "@/utils/format-time";
import { uuidFilterOperators } from "@/utils/parseFilter";

export const TRANSACTION_STATES = [
  "Received",
  "Converting",
  "InReview",
  "Credited",
  "PayoutPending",
  "PayoutSubmitted",
  "PayoutFailed",
  "Completed",
  "Refunded",
];

export const railLabel = (rail?: string | null) =>
  !rail ? "—" : (({ ach_push: "ACH", ach: "ACH", wire: "Wire", sepa: "SEPA" } as Record<string, string>)[rail] ?? rail);

export const transactionColumns: GridColDef<TransactionRowFragment>[] = [
  {
    field: "reference",
    headerName: "Reference",
    width: 140,
    sortable: false,
    align: "left",
    headerAlign: "left",
    renderCell: ({ row }) => (
      <Link to={paths.transactions.view(row.reference)} className="link-primary link-underline-hover font-mono">
        {row.reference}
      </Link>
    ),
  },
  {
    field: "createdAt",
    headerName: "Received",
    type: "dateTime",
    minWidth: 170,
    flex: 1,
    valueGetter: (value: string | null) => (value ? new Date(value) : null),
    renderCell: ({ row }) => fDateTime(row.fundsReceivedAt ?? row.createdAt),
  },
  {
    field: "customerId",
    headerName: "Customer",
    filterOperators: uuidFilterOperators,
    minWidth: 200,
    flex: 1.2,
    sortable: false,
    align: "left",
    headerAlign: "left",
    renderCell: ({ row }) => (
      <Box className="min-w-0">
        <Link to={paths.customers.view(row.customerId)} className="link-primary link-underline-hover block truncate">
          {row.customer?.user?.name ?? `Customer ${row.customerId}`}
        </Link>
        <Typography variant="caption" className="text-text-secondary block truncate">
          {row.customer?.user?.email}
        </Typography>
      </Box>
    ),
  },
  {
    field: "grossAmountInCents",
    headerName: "Deposit",
    minWidth: 130,
    flex: 1,
    filterable: false,
    renderCell: ({ row }) => (
      <Box>
        <MoneyText cents={row.grossAmountInCents} currency={row.currency} variant="body2" className="font-semibold" />
        <Typography variant="caption" className="text-text-secondary block">
          {railLabel(row.rail)}
        </Typography>
      </Box>
    ),
  },
  {
    field: "currency",
    headerName: "Currency",
    type: "singleSelect",
    valueOptions: [
      { value: "usd", label: "USD" },
      { value: "eur", label: "EUR" },
    ],
    width: 110,
    sortable: false,
    valueFormatter: (value: string) => value?.toUpperCase(),
  },
  {
    field: "feeInCents",
    headerName: "Fee",
    minWidth: 100,
    filterable: false,
    renderCell: ({ row }) => <MoneyText cents={row.feeInCents} currency={row.currency} variant="body2" />,
  },
  {
    field: "netAmountInCents",
    headerName: "Payout",
    minWidth: 150,
    sortable: false,
    filterable: false,
    renderCell: ({ row }) => <MoneyText cents={row.netAmountInCents} currency={row.currency} token variant="body2" />,
  },
  {
    field: "state",
    headerName: "Status",
    type: "singleSelect",
    valueOptions: TRANSACTION_STATES.map((value) => ({ value, label: statusLabel("transaction", value) })),
    minWidth: 150,
    renderCell: ({ row }) => <StatusChip kind="transaction" value={row.state} />,
  },
  {
    field: "attempts",
    headerName: "Attempts",
    width: 100,
    sortable: false,
    filterable: false,
    renderCell: ({ row }) => (
      <Box>
        <Typography variant="body2">{row.attempts}</Typography>
        {row.nextRetryAt && (
          <Typography variant="caption" className="text-text-secondary block">
            retry {fRelative(row.nextRetryAt)}
          </Typography>
        )}
      </Box>
    ),
  },
  {
    field: "failureReason",
    headerName: "Failure",
    minWidth: 200,
    flex: 1.5,
    sortable: false,
    filterable: false,
    renderCell: ({ row }) => (
      <Typography variant="body2" className="text-error truncate" title={row.failureReason ?? undefined}>
        {row.failureReason ?? ""}
      </Typography>
    ),
  },
];
