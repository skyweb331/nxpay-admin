import { useSnackbar } from "notistack";
import { useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

import type { WebhookEventRowFragment } from "@/__generated__/graphql";
import { useAuthContext } from "@/auth";
import DataTable from "@/components/DataTable";
import EmptyState from "@/components/EmptyState";
import JsonView from "@/components/JsonView";
import StatusChip, { statusLabel } from "@/components/StatusChip";
import NiDocumentCode from "@/icons/nexture/ni-document-code";
import { REPLAY_WEBHOOK_EVENT, WEBHOOK_EVENTS } from "@/libs/Logs/useApollo";
import { useGridQuery } from "@/routes/hooks";
import { fDateTime } from "@/utils/format-time";
import { errorMessage } from "@/utils/graphql";
import { useMutation, useQuery } from "@apollo/client/react";

function EventDialog({ event, onClose }: { event: WebhookEventRowFragment | null; onClose: () => void }) {
  const { isAdmin } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [replay, { loading }] = useMutation(REPLAY_WEBHOOK_EVENT);

  const onReplay = async () => {
    if (!event) return;
    try {
      await replay({ variables: { id: event.id } });
      enqueueSnackbar("Event queued for processing", { variant: "success" });
      onClose();
    } catch (e) {
      enqueueSnackbar(errorMessage(e), { variant: "error" });
    }
  };

  return (
    <Dialog open={!!event} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <span className="font-mono">{event?.type}</span>
      </DialogTitle>
      <DialogContent>
        <Box className="mb-3 flex flex-row flex-wrap items-center gap-2">
          {event && <StatusChip kind="webhook" value={event.status} />}
          <Typography variant="body2" className="text-text-secondary">
            {event?.bridgeEventId} · received {fDateTime(event?.receivedAt)} · {event?.attempts} attempts
          </Typography>
        </Box>
        {event?.error && (
          <Alert severity="error" className="mb-3">
            {event.error}
          </Alert>
        )}
        <JsonView value={event?.payload ?? null} />
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="grey" onClick={onClose}>
          Close
        </Button>
        {isAdmin && (
          <Button variant="contained" onClick={onReplay} loading={loading}>
            Replay
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default function WebhookEventListView() {
  const [open, setOpen] = useState<WebhookEventRowFragment | null>(null);
  const { variables, gridProps } = useGridQuery({ defaultSort: [{ field: "receivedAt", sort: "desc" }] });
  const { data, previousData, loading, error } = useQuery(WEBHOOK_EVENTS, { variables, pollInterval: 30_000 });
  const result = (data ?? previousData)?.webhookEvents;

  const columns = useMemo<GridColDef<WebhookEventRowFragment>[]>(
    () => [
      {
        field: "receivedAt",
        headerName: "Received",
        type: "dateTime",
        minWidth: 170,
        valueGetter: (value: string) => new Date(value),
        renderCell: ({ row }) => fDateTime(row.receivedAt),
      },
      { field: "category", headerName: "Category", minWidth: 180 },
      {
        field: "type",
        headerName: "Type",
        minWidth: 220,
        flex: 1,
        renderCell: ({ row }) => <span className="font-mono text-sm">{row.type}</span>,
      },
      {
        field: "activityType",
        headerName: "Activity",
        description: "Virtual account activity type (e.g. microdeposit, funds_received), else the object status",
        minWidth: 170,
        renderCell: ({ row }) =>
          row.activityType === "microdeposit" ? (
            <Chip size="small" color="info" variant="outlined" label="microdeposit" />
          ) : (
            <span className="font-mono text-sm">{row.activityType ?? "—"}</span>
          ),
      },
      {
        field: "objectId",
        headerName: "Object",
        minWidth: 160,
        flex: 1,
        sortable: false,
        renderCell: ({ row }) => <span className="truncate font-mono text-xs">{row.objectId ?? "—"}</span>,
      },
      {
        field: "status",
        headerName: "Status",
        type: "singleSelect",
        valueOptions: ["Pending", "Processed", "Ignored", "Failed"].map((value) => ({
          value,
          label: statusLabel("webhook", value),
        })),
        width: 130,
        sortable: false,
        renderCell: ({ row }) => <StatusChip kind="webhook" value={row.status} />,
      },
      { field: "attempts", headerName: "Attempts", type: "number", width: 100, filterable: false },
      {
        field: "error",
        headerName: "Error",
        minWidth: 180,
        flex: 1,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <Typography variant="body2" className="text-error truncate" title={row.error ?? undefined}>
            {row.error ?? ""}
          </Typography>
        ),
      },
      {
        field: "view",
        headerName: "",
        width: 90,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <Button size="small" variant="text" onClick={() => setOpen(row)}>
            View
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
            rows={result?.webhookEvents ?? []}
            rowCount={result?.total ?? 0}
            columns={columns}
            loading={loading && !result}
            slots={{
              noRowsOverlay: () => (
                <EmptyState
                  icon={<NiDocumentCode size={40} />}
                  title="No webhook events"
                  description="Events from Bridge are stored here before processing."
                />
              ),
            }}
          />
        </CardContent>
      </Card>
      <EventDialog event={open} onClose={() => setOpen(null)} />
    </>
  );
}
