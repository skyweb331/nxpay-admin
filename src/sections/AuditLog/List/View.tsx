import { useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

import type { AuditLogRowFragment } from "@/__generated__/graphql";
import DataTable from "@/components/DataTable";
import EmptyState from "@/components/EmptyState";
import JsonView from "@/components/JsonView";
import NiShieldCheck from "@/icons/nexture/ni-shield-check";
import { AUDIT_LOGS } from "@/libs/Logs/useApollo";
import { useGridQuery } from "@/routes/hooks";
import { fDateTime } from "@/utils/format-time";
import { errorMessage } from "@/utils/graphql";
import { andFilter, uuidFilterOperators } from "@/utils/parseFilter";
import { useQuery } from "@apollo/client/react";

function ChangesDialog({ log, onClose }: { log: AuditLogRowFragment | null; onClose: () => void }) {
  return (
    <Dialog open={!!log} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {log?.action} · {log?.entity} {log?.entityId}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" className="text-text-secondary mb-3">
          {fDateTime(log?.createdAt)} by {log?.actor ? `${log.actor.name} (${log.actor.email})` : "the system"}
          {log?.ip && ` from ${log.ip}`}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" className="mb-1">
              Before
            </Typography>
            <JsonView value={log?.before ?? null} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" className="mb-1">
              After
            </Typography>
            <JsonView value={log?.after ?? null} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="grey" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AuditLogListView({ scope }: { scope?: Record<string, unknown> }) {
  const [open, setOpen] = useState<AuditLogRowFragment | null>(null);
  const { variables, gridProps } = useGridQuery({ defaultSort: [{ field: "createdAt", sort: "desc" }] });
  const { data, previousData, loading, error } = useQuery(AUDIT_LOGS, {
    variables: { ...variables, filter: andFilter(variables.filter, scope) },
  });
  const result = (data ?? previousData)?.auditLogs;

  const columns = useMemo<GridColDef<AuditLogRowFragment>[]>(
    () => [
      {
        field: "createdAt",
        headerName: "When",
        type: "dateTime",
        minWidth: 170,
        valueGetter: (value: string) => new Date(value),
        renderCell: ({ row }) => fDateTime(row.createdAt),
      },
      {
        field: "actorId",
        headerName: "Actor",
        filterOperators: uuidFilterOperators,
        minWidth: 200,
        flex: 1,
        sortable: false,
        align: "left",
        headerAlign: "left",
        renderCell: ({ row }) => (
          <Box className="min-w-0">
            <Typography variant="body2" className="truncate">
              {row.actor?.name ?? "System"}
            </Typography>
            <Typography variant="caption" className="text-text-secondary block truncate">
              {row.actor?.email ?? row.actorRole ?? ""}
            </Typography>
          </Box>
        ),
      },
      {
        field: "actorRole",
        headerName: "Role",
        type: "singleSelect",
        valueOptions: ["Admin", "Support", "Customer"],
        width: 110,
        sortable: false,
        valueFormatter: (value: string | null) => value ?? "System",
      },
      {
        field: "action",
        headerName: "Action",
        minWidth: 200,
        flex: 1,
        renderCell: ({ row }) => <span className="font-mono text-sm">{row.action}</span>,
      },
      { field: "entity", headerName: "Entity", width: 150 },
      {
        field: "entityId",
        headerName: "Entity ID",
        width: 110,
        sortable: false,
        valueFormatter: (value: string | null) => value ?? "—",
      },
      {
        field: "ip",
        headerName: "IP",
        width: 140,
        sortable: false,
        valueFormatter: (value: string | null) => value ?? "—",
      },
      {
        field: "changes",
        headerName: "",
        width: 100,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <Button size="small" variant="text" onClick={() => setOpen(row)}>
            Details
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <>
      {error && (
        <Alert severity="error" className="mb-4">
          {errorMessage(error)}
        </Alert>
      )}
      <Card>
        <CardContent>
          <DataTable
            {...gridProps}
            rows={result?.auditLogs ?? []}
            rowCount={result?.total ?? 0}
            columns={columns}
            loading={loading && !result}
            slots={{
              noRowsOverlay: () => <EmptyState icon={<NiShieldCheck size={40} />} title="No audit entries" />,
            }}
          />
        </CardContent>
      </Card>
      <ChangesDialog log={open} onClose={() => setOpen(null)} />
    </>
  );
}
