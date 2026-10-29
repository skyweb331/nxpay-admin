import { useMemo } from "react";
import { Link } from "react-router";

import { Alert, Box, Card, CardContent, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

import type { SupportTicketRowFragment } from "@/__generated__/graphql";
import DataTable from "@/components/DataTable";
import EmptyState from "@/components/EmptyState";
import ContentWrapper from "@/components/layout/containers/content-wrapper";
import StatusChip, { statusLabel } from "@/components/StatusChip";
import NiMessages from "@/icons/nexture/ni-messages";
import { SUPPORT_TICKETS } from "@/libs/SupportTicket/useApollo";
import { useGridQuery } from "@/routes/hooks";
import { paths } from "@/routes/paths";
import { fDateTime, fRelative } from "@/utils/format-time";
import { errorMessage } from "@/utils/graphql";
import { uuidFilterOperators } from "@/utils/parseFilter";
import { useQuery } from "@apollo/client/react";

export const TICKET_STATUSES = ["Open", "Pending", "Resolved", "Closed"] as const;

export default function SupportListView() {
  const { variables, gridProps } = useGridQuery({ defaultSort: [{ field: "lastMessageAt", sort: "desc" }] });
  const { data, previousData, loading, error } = useQuery(SUPPORT_TICKETS, { variables, pollInterval: 30_000 });
  const result = (data ?? previousData)?.supportTickets;

  const columns = useMemo<GridColDef<SupportTicketRowFragment>[]>(
    () => [
      {
        field: "subject",
        headerName: "Subject",
        minWidth: 260,
        flex: 2,
        sortable: false,
        renderCell: ({ row }) => (
          <Box className="min-w-0">
            <Link to={paths.support.view(row.id)} className="link-primary link-underline-hover block truncate">
              {row.subject}
            </Link>
            <Typography variant="caption" className="text-text-secondary">
              {row.reference} · opened {fDateTime(row.createdAt)}
            </Typography>
          </Box>
        ),
      },
      {
        field: "customerId",
        headerName: "Customer",
        filterOperators: uuidFilterOperators,
        minWidth: 200,
        flex: 1,
        sortable: false,
        align: "left",
        headerAlign: "left",
        renderCell: ({ row }) => (
          <Box className="min-w-0">
            <Link
              to={paths.customers.view(row.customerId)}
              className="link-primary link-underline-hover block truncate"
            >
              {row.customer?.user?.name ?? `Customer ${row.customerId}`}
            </Link>
            <Typography variant="caption" className="text-text-secondary block truncate">
              {row.customer?.user?.email}
            </Typography>
          </Box>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        type: "singleSelect",
        valueOptions: TICKET_STATUSES.map((value) => ({ value, label: statusLabel("ticket", value) })),
        width: 160,
        renderCell: ({ row }) => <StatusChip kind="ticket" value={row.status} />,
      },
      {
        field: "assigneeId",
        headerName: "Assignee",
        filterOperators: uuidFilterOperators,
        width: 160,
        sortable: false,
        align: "left",
        headerAlign: "left",
        renderCell: ({ row }) => row.assignee?.name ?? <span className="text-text-secondary">Unassigned</span>,
      },
      {
        field: "lastMessageAt",
        headerName: "Last message",
        type: "dateTime",
        width: 150,
        valueGetter: (value: string | null) => (value ? new Date(value) : null),
        renderCell: ({ row }) => fRelative(row.lastMessageAt ?? row.createdAt),
      },
    ],
    [],
  );

  return (
    <ContentWrapper>
      {error && (
        <Alert severity="error" className="mb-4">
          {errorMessage(error)}
        </Alert>
      )}
      <Card>
        <CardContent>
          <DataTable
            {...gridProps}
            rows={result?.supportTickets ?? []}
            rowCount={result?.total ?? 0}
            columns={columns}
            loading={loading && !result}
            slots={{
              noRowsOverlay: () => <EmptyState icon={<NiMessages size={40} />} title="No tickets" />,
            }}
          />
        </CardContent>
      </Card>
    </ContentWrapper>
  );
}
