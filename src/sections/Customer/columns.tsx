import { Link } from "react-router";

import { Box, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

import type { CustomerRowFragment } from "@/__generated__/graphql";
import StatusChip, { statusLabel } from "@/components/StatusChip";
import { paths } from "@/routes/paths";
import { fDate, fRelative } from "@/utils/format-time";
import { uuidFilterOperators } from "@/utils/parseFilter";

const KYC_STATUSES = [
  "not_started",
  "incomplete",
  "awaiting_questionnaire",
  "under_review",
  "paused",
  "approved",
  "rejected",
  "offboarded",
];

export const ONBOARDING_STEP_LABELS: Record<string, string> = {
  ChooseType: "Choosing account type",
  AcceptTos: "Accepting Bridge terms",
  CompleteKyc: "Completing KYC",
  UnderReview: "KYC under review",
  Finalize: "Creating accounts",
  Done: "Done",
  Rejected: "Rejected",
};

/** Sign-ups staff haven't approved can't sign in yet, whatever their onboarding status. */
export const customerStatus = (row: CustomerRowFragment) =>
  row.user && !row.user.approvedAt ? "AwaitingApproval" : row.status;

export const customerColumns: GridColDef<CustomerRowFragment>[] = [
  {
    field: "id",
    headerName: "Customer",
    filterOperators: uuidFilterOperators,
    minWidth: 240,
    flex: 1.5,
    align: "left",
    headerAlign: "left",
    renderCell: ({ row }) => (
      <Box className="min-w-0">
        <Link to={paths.customers.view(row.id)} className="link-primary link-underline-hover block truncate">
          {row.user?.name ?? `Customer ${row.id}`}
        </Link>
        <Typography variant="caption" className="text-text-secondary block truncate">
          {row.user?.email}
        </Typography>
      </Box>
    ),
  },
  {
    field: "type",
    headerName: "Type",
    type: "singleSelect",
    valueOptions: [
      { value: "individual", label: "Individual" },
      { value: "business", label: "Business" },
    ],
    width: 120,
    sortable: false,
    valueFormatter: (value: string | null) => (value === "business" ? "Business" : value ? "Individual" : "—"),
  },
  {
    field: "country",
    headerName: "Country",
    width: 100,
    valueFormatter: (value: string | null) => value ?? "—",
  },
  {
    field: "status",
    headerName: "Status",
    type: "singleSelect",
    valueOptions: ["Onboarding", "Active", "Suspended"].map((value) => ({
      value,
      label: statusLabel("customer", value),
    })),
    width: 130,
    renderCell: ({ row }) => <StatusChip kind="customer" value={customerStatus(row)} />,
  },
  {
    field: "kycStatus",
    headerName: "KYC",
    type: "singleSelect",
    valueOptions: KYC_STATUSES.map((value) => ({ value, label: statusLabel("kyc", value) })),
    width: 140,
    renderCell: ({ row }) => <StatusChip kind="kyc" value={row.kycStatus} />,
  },
  {
    field: "onboardingStep",
    headerName: "Onboarding",
    minWidth: 170,
    sortable: false,
    filterable: false,
    valueFormatter: (value: string) => ONBOARDING_STEP_LABELS[value] ?? value,
  },
  {
    field: "createdAt",
    headerName: "Signed up",
    type: "date",
    width: 130,
    valueGetter: (value: string | null) => (value ? new Date(value) : null),
    renderCell: ({ row }) => fDate(row.createdAt),
  },
  {
    field: "lastLoginAt",
    headerName: "Last sign-in",
    width: 140,
    sortable: false,
    filterable: false,
    valueGetter: (_value, row) => row.user?.lastLoginAt ?? null,
    renderCell: ({ row }) => fRelative(row.user?.lastLoginAt),
  },
];
